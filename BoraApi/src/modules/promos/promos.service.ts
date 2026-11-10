import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { CommonErrorCodes } from '../../common/constants/error-codes';
import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { isUniqueViolation } from '../../common/utils/database.utils';
import { normalizePublicCode, randomReadableCode } from '../../shared/helpers/random-code.helper';
import { assertOwnsEventVenue } from '../business/business-ownership';
import { Event, EventStatus } from '../events/entities/event.entity';
import { assertEventAcceptsParticipation } from '../events/event-access';
import { Reward, RewardKind } from '../rewards/entities/reward.entity';
import { RewardRedemption } from '../rewards/entities/reward-redemption.entity';
import {
  formatRewardTime,
  formatSaoPauloClock,
  isRewardEventDay,
  isWithinRewardWindow,
  rewardWindowEnd,
} from '../rewards/reward-window';
import { RewardsService } from '../rewards/rewards.service';
import { User } from '../users/entities/user.entity';
import { PromoScan } from './entities/promo-scan.entity';

const QR_CODE_LENGTH = 10;
const QR_CODE_ATTEMPTS = 5;
/** Prazo para retirar o brinde no balcão depois de ler o QR (limitado ao fim da janela da promoção). */
const CLAIM_TTL_MS = 60 * 60 * 1000;
const REDEMPTIONS_LIMIT = 200;

export type ClaimStatus = 'active' | 'expired' | 'delivered';

export type GiftClaim = {
  kind: 'gift';
  status: ClaimStatus;
  title: string;
  publicCode: string;
  claimedAt: Date;
  expiresAt: Date | null;
  deliveredAt: Date | null;
};

export type ClaimResult = GiftClaim | { kind: RewardKind; status: 'info' };

export type PromoStats = {
  rewardId: string;
  scans: number;
  newSignups: number;
  existingUsers: number;
  redeemed: number;
  delivered: number;
};

/** O resgate antigo, pelo check-in, foi usado no app na hora do resgate: conta como entregue
 * (sem migration de dados; calculado aqui). */
const deliveredAtOf = (redemption: Pick<RewardRedemption, 'source' | 'redeemedAt' | 'deliveredAt'>) =>
  redemption.deliveredAt ?? (redemption.source === 'checkin' ? redemption.redeemedAt : null);

const firstName = (name: string | null | undefined) => (name ?? '').trim().split(/\s+/)[0] ?? '';

/**
 * QR impresso das promoções: página pública da promoção, leituras, resgate do brinde pelo QR
 * (sem check-in, com prazo para retirar) e o lado do comércio (código do QR, números, lista de
 * resgates e baixa pelo código da pessoa).
 */
@Injectable()
export class PromosService {
  /** Relógio injetável (os testes simulam outro horário/dia). */
  clock: () => Date = () => new Date();

  constructor(
    @InjectRepository(Reward) private readonly rewardsRepository: Repository<Reward>,
    @InjectRepository(PromoScan) private readonly scansRepository: Repository<PromoScan>,
    private readonly rewardsService: RewardsService,
  ) {}

  private get manager(): EntityManager {
    return this.rewardsRepository.manager;
  }

  // ---------------------------------------------------------------- lado do cliente (QR impresso)

  async getPromo(code: string) {
    const reward = await this.findByCode(code);
    const event = reward.event;
    const now = this.clock();
    return {
      code: reward.qrCode,
      kind: reward.kind,
      title: reward.title,
      description: reward.description,
      priceCents: reward.priceCents,
      percentOff: reward.percentOff,
      validFrom: formatRewardTime(reward.validFrom),
      validUntil: formatRewardTime(reward.validUntil),
      event: { id: event.id, title: event.name, startsAt: event.startsAt, endsAt: event.endsAt },
      venue: { id: event.venue?.id ?? event.venueId, name: event.venue?.name ?? '' },
      availableNow: this.isAvailableNow(reward, event, now),
      soldOut: this.isSoldOut(reward),
    };
  }

  /** Registra a leitura do QR. No máximo uma a cada 30 min por pessoa (logada) ou aparelho, para
   * recarregar a página não inflar o número. Sem login e sem aparelho não dá para contar, e a
   * leitura de uma conta de comércio (ex.: o dono testando o QR) não é de cliente. */
  async recordScan(code: string, userId: string | null, deviceId: string | null): Promise<{ recorded: boolean }> {
    const reward = await this.findByCode(code);
    const device = deviceId?.trim() || null;
    if (!userId && !device) return { recorded: false };
    if (userId) {
      const user = await this.manager.findOne(User, { where: { id: userId }, select: { id: true, accountType: true } });
      if (user?.accountType === 'business') return { recorded: false };
    }

    const recent = this.scansRepository
      .createQueryBuilder('s')
      .where('s.rewardId = :rewardId', { rewardId: reward.id })
      .andWhere("s.created_at > now() - interval '30 minutes'");
    if (userId && device) recent.andWhere('(s.userId = :userId OR s.deviceId = :device)', { userId, device });
    else if (userId) recent.andWhere('s.userId = :userId', { userId });
    else recent.andWhere('s.deviceId = :device', { device });
    if (await recent.getExists()) return { recorded: false };

    await this.scansRepository.save(
      this.scansRepository.create({ rewardId: reward.id, userId, deviceId: device, existingUser: Boolean(userId) }),
    );
    return { recorded: true };
  }

  /**
   * Resgate pelo QR impresso. Preço fixo/desconto: só informa (é pedir no balcão). Brinde: um por
   * pessoa, no dia do evento e dentro do horário, com prazo para retirar de 1 h (limitado ao fim
   * da janela). Ler de novo devolve o mesmo resgate; se ele venceu sem ser entregue e a promoção
   * ainda vale, renova o prazo (sem gastar estoque).
   */
  async claim(code: string, userId: string): Promise<ClaimResult> {
    const found = await this.findByCode(code);
    const account = await this.manager.findOne(User, {
      where: { id: userId },
      select: { id: true, emailVerified: true },
    });
    if (!account?.emailVerified) {
      throw new ForbiddenException({
        message: 'Confirme seu e-mail para resgatar.',
        errorCode: CommonErrorCodes.EMAIL_NOT_VERIFIED,
      });
    }
    if (found.kind !== 'gift') return { kind: found.kind, status: 'info' };

    return this.manager.transaction(async (manager) => {
      // Mesma trava do resgate via check-in: leituras simultâneas entram em fila.
      const reward = await this.rewardsService.lockReward(manager, found.id);
      const event = await manager.findOne(Event, { where: { id: reward.eventId } });
      if (!event) throw new ResourceNotFoundException('Event', reward.eventId);
      const user = await manager.findOneOrFail(User, { where: { id: userId }, select: { id: true, publicCode: true } });
      const redemptions = manager.getRepository(RewardRedemption);
      const now = this.clock();

      // Trava o resgate também: a renovação não corre junto com a baixa no balcão.
      const existing = await redemptions.findOne({
        where: { userId, rewardId: reward.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (existing) {
        // Venceu sem ser entregue e a promoção ainda vale: renova só o prazo. A hora do resgate
        // (`redeemedAt`) fica a original, que é a que o comércio confere na lista.
        if (this.claimStatus(existing, now) === 'expired' && this.isAvailableNow(reward, event, now)) {
          existing.expiresAt = this.claimExpiry(reward, now);
          await redemptions.update({ id: existing.id }, { expiresAt: existing.expiresAt });
        }
        return this.toGiftClaim(reward, existing, user.publicCode, now);
      }

      assertEventAcceptsParticipation(event);
      if (!this.isAvailableNow(reward, event, now)) {
        throw new BusinessException(
          `Esta promoção vale no dia do evento, das ${formatRewardTime(reward.validFrom)} às ${formatRewardTime(reward.validUntil)}.`,
        );
      }
      if (this.isSoldOut(reward)) throw new BusinessException('Benefício esgotado');
      await this.rewardsService.consumeStock(manager, reward.id);

      const redemption = await redemptions.save(
        redemptions.create({
          rewardId: reward.id,
          userId,
          redeemedAt: now,
          source: 'qr',
          expiresAt: this.claimExpiry(reward, now),
          deliveredAt: null,
        }),
      );
      return this.toGiftClaim(reward, redemption, user.publicCode, now);
    });
  }

  /** Conta o cadastro para a promoção cujo QR a pessoa leu antes de criar a conta: só conta
   * nova (menos de 2 h) e sem origem ainda. Condição inteira no UPDATE, então é atômico. */
  async attributeSignup(code: string, userId: string): Promise<{ attributed: boolean }> {
    const reward = await this.findByCode(code);
    const result = await this.manager
      .createQueryBuilder()
      .update(User)
      .set({ signupRewardId: reward.id })
      .where('id = :userId', { userId })
      .andWhere('signup_reward_id IS NULL')
      .andWhere("created_at > now() - interval '2 hours'")
      .execute();
    return { attributed: Boolean(result.affected) };
  }

  // ---------------------------------------------------------------- lado do comércio

  /** Código do QR impresso da promoção, criado na primeira vez (aleatório e único). */
  async getQr(ownerId: string, rewardId: string): Promise<{ code: string; path: string }> {
    const reward = await this.findOwnedReward(ownerId, rewardId);
    let code = reward.qrCode;
    for (let attempt = 0; !code && attempt < QR_CODE_ATTEMPTS; attempt += 1) {
      try {
        // `qr_code IS NULL`: dois pedidos ao mesmo tempo não trocam o código um do outro.
        await this.rewardsRepository
          .createQueryBuilder()
          .update(Reward)
          .set({ qrCode: randomReadableCode(QR_CODE_LENGTH) })
          .where('id = :rewardId', { rewardId })
          .andWhere('qr_code IS NULL')
          .execute();
      } catch (err) {
        if (!isUniqueViolation(err)) throw err;
        continue; // colisão com o código de outra promoção: tenta outro
      }
      code = (await this.rewardsRepository.findOne({ where: { id: rewardId }, select: { id: true, qrCode: true } }))
        ?.qrCode ?? null;
    }
    if (!code) throw new Error('Não foi possível gerar o código do QR.');
    return { code, path: `/p/${code}` };
  }

  /** Números de cada promoção do evento, para o painel do comércio. */
  async eventStats(ownerId: string, eventId: string): Promise<PromoStats[]> {
    const event = await this.manager.findOne(Event, { where: { id: eventId }, relations: ['venue'] });
    if (!event) throw new ResourceNotFoundException('Event', eventId);
    assertOwnsEventVenue(event.venue, ownerId);

    const rewards = await this.rewardsRepository.find({
      where: { eventId },
      select: { id: true },
      order: { createdAt: 'ASC' },
    });
    if (!rewards.length) return [];
    const ids = rewards.map((reward) => reward.id);

    const [scans, signups, existing, redemptions] = await Promise.all([
      // Pessoas/aparelhos distintos: o aparelho identifica mesmo antes do login.
      this.manager.query<{ rewardId: string; count: number }[]>(
        `SELECT "reward_id" AS "rewardId", COUNT(DISTINCT COALESCE("device_id", "user_id"::text))::int AS "count"
         FROM "promo_scans" WHERE "reward_id" = ANY($1) AND "deleted_at" IS NULL GROUP BY "reward_id"`,
        [ids],
      ),
      this.manager.query<{ rewardId: string; count: number }[]>(
        `SELECT "signup_reward_id" AS "rewardId", COUNT(*)::int AS "count"
         FROM "users" WHERE "signup_reward_id" = ANY($1) GROUP BY "signup_reward_id"`,
        [ids],
      ),
      // "Já tinham conta": leu logado e não é quem se cadastrou por essa mesma promoção.
      this.manager.query<{ rewardId: string; count: number }[]>(
        `SELECT s."reward_id" AS "rewardId", COUNT(DISTINCT s."user_id")::int AS "count"
         FROM "promo_scans" s JOIN "users" u ON u."id" = s."user_id"
         WHERE s."reward_id" = ANY($1) AND s."existing_user" AND s."deleted_at" IS NULL
           AND u."signup_reward_id" IS DISTINCT FROM s."reward_id"
         GROUP BY s."reward_id"`,
        [ids],
      ),
      this.manager.query<{ rewardId: string; redeemed: number; delivered: number }[]>(
        `SELECT "reward_id" AS "rewardId", COUNT(*)::int AS "redeemed", (COUNT(*) FILTER (WHERE "delivered_at" IS NOT NULL OR "source" = 'checkin'))::int AS "delivered"
         FROM "reward_redemptions" WHERE "reward_id" = ANY($1) AND "deleted_at" IS NULL GROUP BY "reward_id"`,
        [ids],
      ),
    ]);

    const countOf = (rows: { rewardId: string; count: number }[], id: string) =>
      Number(rows.find((row) => row.rewardId === id)?.count ?? 0);
    return ids.map((rewardId) => {
      const redemption = redemptions.find((row) => row.rewardId === rewardId);
      return {
        rewardId,
        scans: countOf(scans, rewardId),
        newSignups: countOf(signups, rewardId),
        existingUsers: countOf(existing, rewardId),
        redeemed: Number(redemption?.redeemed ?? 0),
        delivered: Number(redemption?.delivered ?? 0),
      };
    });
  }

  /** Resgates da promoção, mais recentes primeiro, para o comércio conferir com o que anotou.
   * Só o primeiro nome da pessoa, por privacidade. */
  async redemptions(ownerId: string, rewardId: string) {
    await this.findOwnedReward(ownerId, rewardId);
    const rows = await this.manager
      .getRepository(RewardRedemption)
      .createQueryBuilder('rr')
      .withDeleted() // a pessoa pode ter excluído a conta depois de resgatar
      .leftJoin('rr.user', 'u')
      .select([
        'rr.id',
        'rr.source',
        'rr.redeemedAt',
        'rr.expiresAt',
        'rr.deliveredAt',
        'u.id',
        'u.name',
        'u.publicCode',
      ])
      .where('rr.rewardId = :rewardId', { rewardId })
      .andWhere('rr.deletedAt IS NULL')
      .orderBy('rr.redeemedAt', 'DESC')
      .take(REDEMPTIONS_LIMIT)
      .getMany();
    const now = this.clock();
    return rows.map((row) => ({
      publicCode: row.user?.publicCode ?? null,
      firstName: firstName(row.user?.name),
      claimedAt: row.redeemedAt,
      expiresAt: row.expiresAt,
      expired: this.claimStatus(row, now) === 'expired',
      deliveredAt: deliveredAtOf(row),
    }));
  }

  /** Baixa do brinde pelo código da pessoa, quando o comércio entrega no balcão. */
  async deliver(ownerId: string, rewardId: string, rawCode: string) {
    await this.findOwnedReward(ownerId, rewardId);
    const publicCode = normalizePublicCode(rawCode);
    return this.manager.transaction(async (manager) => {
      const notScanned = () => new BusinessException('Essa pessoa não leu o QR desta promoção.');
      const user = await manager.findOne(User, {
        where: { publicCode },
        select: { id: true, name: true, publicCode: true },
      });
      if (!user) throw notScanned();
      // Trava o resgate: duas baixas ao mesmo tempo (dois atendentes) não entregam duas vezes.
      const redemption = await manager.findOne(RewardRedemption, {
        where: { rewardId, userId: user.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!redemption) throw notScanned();
      const deliveredAt = deliveredAtOf(redemption);
      if (deliveredAt) {
        throw new BusinessException(`Benefício já entregue às ${formatSaoPauloClock(deliveredAt)}.`);
      }
      const now = this.clock();
      if (redemption.expiresAt && redemption.expiresAt < now) {
        throw new BusinessException('O prazo desse benefício expirou. Peça para a pessoa ler o QR de novo.');
      }
      await manager.update(RewardRedemption, { id: redemption.id }, { deliveredAt: now });
      return { publicCode: user.publicCode, firstName: firstName(user.name), deliveredAt: now };
    });
  }

  // ---------------------------------------------------------------- regras

  /** Dá para resgatar agora: evento aceita participação, é o dia do evento e está no horário. */
  isAvailableNow(reward: Reward, event: Event, now: Date): boolean {
    return (
      event.status !== EventStatus.REJECTED &&
      isRewardEventDay(event, reward.validFrom, reward.validUntil, now) &&
      isWithinRewardWindow(reward.validFrom, reward.validUntil, now)
    );
  }

  private isSoldOut(reward: Reward): boolean {
    return reward.kind === 'gift' && reward.quantityTotal != null && reward.quantityRedeemed >= reward.quantityTotal;
  }

  /** Prazo para retirar: 1 h a partir da leitura, sem passar do fim da janela da promoção. */
  private claimExpiry(reward: Reward, now: Date): Date {
    const windowEnd = rewardWindowEnd(reward.validUntil, now).getTime();
    return new Date(Math.min(now.getTime() + CLAIM_TTL_MS, windowEnd));
  }

  /** Entregue (baixa no balcão ou resgate antigo pelo check-in) > vencido > ativo. */
  private claimStatus(redemption: RewardRedemption, now: Date): ClaimStatus {
    if (deliveredAtOf(redemption)) return 'delivered';
    if (redemption.expiresAt && redemption.expiresAt < now) return 'expired';
    return 'active';
  }

  private toGiftClaim(reward: Reward, redemption: RewardRedemption, publicCode: string, now: Date): GiftClaim {
    return {
      kind: 'gift',
      status: this.claimStatus(redemption, now),
      title: reward.title,
      publicCode,
      claimedAt: redemption.redeemedAt,
      expiresAt: redemption.expiresAt,
      deliveredAt: deliveredAtOf(redemption),
    };
  }

  private async findByCode(rawCode: string): Promise<Reward & { event: Event }> {
    const code = rawCode.trim().toUpperCase();
    const reward =
      code && code.length <= 16
        ? await this.rewardsRepository.findOne({ where: { qrCode: code }, relations: ['event', 'event.venue'] })
        : null;
    if (!reward?.event) throw new ResourceNotFoundException('Promo', rawCode);
    return reward;
  }

  /** Promoção de um evento do local do comércio logado (404 se não existe, 403 se é de outro). */
  private async findOwnedReward(ownerId: string, rewardId: string): Promise<Reward> {
    const reward = await this.rewardsRepository.findOne({
      where: { id: rewardId },
      relations: ['event', 'event.venue'],
    });
    if (!reward) throw new ResourceNotFoundException('Reward', rewardId);
    assertOwnsEventVenue(reward.event?.venue, ownerId);
    return reward;
  }
}
