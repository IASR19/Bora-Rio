import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';

import { BusinessException } from '../../common/exceptions/business.exception';
import { ResourceNotFoundException } from '../../common/exceptions/resource-not-found.exception';
import { assertOwnsEventVenue } from '../business/business-ownership';
import { CheckIn } from '../checkins/entities/checkin.entity';
import { Event } from '../events/entities/event.entity';
import { assertEventAcceptsParticipation } from '../events/event-access';
import { CreateRewardDto, UpdateRewardDto } from './dto/reward.dto';
import { Reward } from './entities/reward.entity';
import { RewardRedemption } from './entities/reward-redemption.entity';
import { formatRewardTime, isWithinRewardWindow } from './reward-window';

type RewardFields = Pick<
  Reward,
  | 'kind'
  | 'title'
  | 'description'
  | 'priceCents'
  | 'percentOff'
  | 'validFrom'
  | 'validUntil'
  | 'quantityTotal'
>;

@Injectable()
export class RewardsService {
  constructor(
    @InjectRepository(Reward) private readonly rewardsRepository: Repository<Reward>,
    @InjectRepository(RewardRedemption)
    private readonly redemptionsRepository: Repository<RewardRedemption>,
    @InjectRepository(CheckIn) private readonly checkinsRepository: Repository<CheckIn>,
    @InjectRepository(Event) private readonly eventsRepository: Repository<Event>,
  ) {}

  findByEvent(eventId: string): Promise<Reward[]> {
    return this.rewardsRepository.find({ where: { eventId }, order: { createdAt: 'ASC' } });
  }

  async myRedemptions(userId: string, eventId: string): Promise<string[]> {
    const rewards = await this.rewardsRepository.find({ where: { eventId } });
    if (!rewards.length) return [];
    const redemptions = await this.redemptionsRepository.find({
      where: { userId, rewardId: In(rewards.map((r) => r.id)) },
    });
    return redemptions.map((r) => r.rewardId);
  }

  async create(userId: string, eventId: string, dto: CreateRewardDto): Promise<Reward> {
    const event = await this.eventsRepository.findOne({ where: { id: eventId }, relations: ['venue'] });
    if (!event) throw new ResourceNotFoundException('Event', eventId);
    assertOwnsEventVenue(event.venue, userId);
    assertEventAcceptsParticipation(event);

    const fields = this.normalize({
      kind: dto.kind,
      title: dto.title,
      description: dto.description ?? null,
      priceCents: dto.priceCents ?? null,
      percentOff: dto.percentOff ?? null,
      validFrom: dto.validFrom,
      validUntil: dto.validUntil,
      quantityTotal: dto.quantityTotal ?? null,
    });
    return this.rewardsRepository.save(
      this.rewardsRepository.create({ ...fields, eventId, quantityRedeemed: 0 }),
    );
  }

  async update(userId: string, rewardId: string, dto: UpdateRewardDto): Promise<Reward> {
    await this.findOwned(userId, rewardId);
    return this.rewardsRepository.manager.transaction(async (manager) => {
      // Mesma trava do resgate: a checagem de quantidade usa o `quantityRedeemed` atual, e o update
      // só grava os campos editáveis (nunca sobrescreve o contador de resgates).
      const reward = await this.lockReward(manager, rewardId);
      // Edição parcial: só sobrescreve o que veio no pedido (null limpa o campo opcional).
      const fields = this.normalize({
        kind: dto.kind ?? reward.kind,
        title: dto.title ?? reward.title,
        description: dto.description !== undefined ? dto.description : reward.description,
        priceCents: dto.priceCents !== undefined ? dto.priceCents : reward.priceCents,
        percentOff: dto.percentOff !== undefined ? dto.percentOff : reward.percentOff,
        validFrom: dto.validFrom ?? reward.validFrom,
        validUntil: dto.validUntil ?? reward.validUntil,
        quantityTotal: dto.quantityTotal !== undefined ? dto.quantityTotal : reward.quantityTotal,
      });
      if (fields.quantityTotal != null && fields.quantityTotal < reward.quantityRedeemed) {
        throw new BusinessException(
          `A quantidade não pode ser menor que os ${reward.quantityRedeemed} brindes já resgatados`,
        );
      }
      await manager.update(Reward, { id: rewardId }, fields);
      return manager.findOneOrFail(Reward, { where: { id: rewardId } });
    });
  }

  /** Brinde já resgatado não some: o resgate é o comprovante do cliente e entra no painel. */
  async remove(userId: string, rewardId: string): Promise<void> {
    await this.findOwned(userId, rewardId);
    await this.rewardsRepository.manager.transaction(async (manager) => {
      const reward = await this.lockReward(manager, rewardId);
      const redeemed =
        reward.quantityRedeemed > 0 || (await manager.exists(RewardRedemption, { where: { rewardId } }));
      if (redeemed) throw new BusinessException('Este brinde já foi resgatado e não pode ser apagado.');
      await manager.delete(Reward, { id: rewardId });
    });
  }

  async redeem(userId: string, rewardId: string): Promise<RewardRedemption> {
    return this.rewardsRepository.manager.transaction(async (manager) => {
      // Trava a linha da promoção: resgates simultâneos (do mesmo usuário ou do último brinde)
      // entram em fila, e a checagem de "já resgatou" e de estoque fica confiável.
      const reward = await this.lockReward(manager, rewardId);
      const event = await manager.findOne(Event, { where: { id: reward.eventId } });
      if (!event) throw new ResourceNotFoundException('Event', reward.eventId);
      assertEventAcceptsParticipation(event);

      if (reward.kind !== 'gift') {
        throw new BusinessException('Esta promoção não precisa de resgate: é só pedir no balcão.');
      }

      if (!isWithinRewardWindow(reward.validFrom, reward.validUntil)) {
        throw new BusinessException(
          `Este brinde só pode ser resgatado das ${formatRewardTime(reward.validFrom)} às ${formatRewardTime(reward.validUntil)}.`,
        );
      }

      const alreadyRedeemed = await manager.findOne(RewardRedemption, { where: { userId, rewardId } });
      if (alreadyRedeemed) {
        throw new BusinessException('Você já resgatou este benefício');
      }

      if (reward.quantityTotal != null && reward.quantityRedeemed >= reward.quantityTotal) {
        throw new BusinessException('Benefício esgotado');
      }

      const checkin = await manager.findOne(CheckIn, { where: { userId, eventId: reward.eventId } });
      if (!checkin) {
        throw new BusinessException('É necessário fazer check-in antes de resgatar o benefício');
      }

      // Incremento atômico com a mesma condição de estoque, por segurança extra além da trava.
      const result = await manager
        .createQueryBuilder()
        .update(Reward)
        .set({ quantityRedeemed: () => 'quantity_redeemed + 1' })
        .where('id = :id', { id: rewardId })
        .andWhere('(quantity_total IS NULL OR quantity_redeemed < quantity_total)')
        .execute();
      if (!result.affected) throw new BusinessException('Benefício esgotado');

      const redemptions = manager.getRepository(RewardRedemption);
      return redemptions.save(redemptions.create({ rewardId, userId, redeemedAt: new Date() }));
    });
  }

  /** Trava a linha da promoção até o fim da transação (resgate, edição e remoção entram em fila). */
  private async lockReward(manager: EntityManager, rewardId: string): Promise<Reward> {
    const reward = await manager.findOne(Reward, {
      where: { id: rewardId },
      lock: { mode: 'pessimistic_write' },
    });
    if (!reward) throw new ResourceNotFoundException('Reward', rewardId);
    return reward;
  }

  /** Carrega a promoção e confere que o evento é do local do comércio logado. */
  private async findOwned(userId: string, rewardId: string): Promise<Reward> {
    const reward = await this.rewardsRepository.findOne({
      where: { id: rewardId },
      relations: ['event', 'event.venue'],
    });
    if (!reward) throw new ResourceNotFoundException('Reward', rewardId);
    assertOwnsEventVenue(reward.event?.venue, userId);
    return reward;
  }

  /** Regras por tipo, aplicadas ao resultado final (criação ou edição):
   * preço fixo exige preço, desconto exige %, e só brinde tem quantidade. */
  private normalize(fields: RewardFields): RewardFields {
    const result: RewardFields = { ...fields, description: fields.description?.trim() || null };
    if (result.kind === 'fixed_price') {
      if (!result.priceCents || result.priceCents <= 0) {
        throw new BusinessException('Informe o preço da promoção');
      }
      return { ...result, percentOff: null, quantityTotal: null };
    }
    if (result.kind === 'percent_off') {
      if (!result.percentOff || result.percentOff < 1 || result.percentOff > 100) {
        throw new BusinessException('Informe um desconto entre 1% e 100%');
      }
      return { ...result, priceCents: null, quantityTotal: null };
    }
    return { ...result, priceCents: null, percentOff: null };
  }
}
