import 'dotenv/config';

import dataSource from '../data-source';
import { applyBusinessReview } from '../modules/business/business-review';
import { Event, EventStatus } from '../modules/events/entities/event.entity';
import { BusinessVerificationStatus, User } from '../modules/users/entities/user.entity';
import { Venue } from '../modules/venues/entities/venue.entity';

/**
 * Revisão manual da validação de ponto comercial (CNPJ + contrato social) que a IA deixou em análise.
 *
 *   npm run business:review -- --list
 *   npm run business:review -- --email dono@bar.com --approve
 *   npm run business:review -- --email dono@bar.com --reject --note "Contrato de outra empresa"
 *   npm run business:review -- --email dono@bar.com --reset   (apaga a validação: o usuário reenvia do zero)
 *
 * Aprovar e rejeitar seguem as mesmas regras do painel admin (ver applyBusinessReview): aprovar
 * verifica o local do comércio e publica os eventos comerciais dele em análise; rejeitar solta o
 * CNPJ pro dono de verdade poder se cadastrar.
 */
function arg(name: string): string | undefined {
  const index = process.argv.indexOf(`--${name}`);
  return index >= 0 ? process.argv[index + 1] : undefined;
}

async function reviewBusiness(): Promise<void> {
  await dataSource.initialize();
  try {
    const users = dataSource.getRepository(User);

    if (process.argv.includes('--list')) {
      const pending = await users
        .createQueryBuilder('u')
        .addSelect('u.businessAiNote')
        .where('u.businessVerificationStatus = :status', { status: BusinessVerificationStatus.PENDING })
        .getMany();
      if (!pending.length) console.log('Nenhuma validação de CNPJ em análise.');
      for (const user of pending) {
        console.log(
          `${user.email} | CNPJ ${user.businessCnpj} | ${user.businessName ?? '?'} | ${user.businessAiNote ?? '-'}`,
        );
      }
      return;
    }

    const email = arg('email');
    if (email && process.argv.includes('--reset')) {
      const user = await users.findOne({ where: { email } });
      if (!user) throw new Error(`Usuário ${email} não encontrado`);
      await dataSource.transaction(async (manager) => {
        await manager.update(
          User,
          { id: user.id },
          {
            businessCnpj: null,
            businessName: null,
            businessVerificationStatus: null,
            businessVerificationNote: null,
            businessAiNote: null,
            businessContractFile: null,
            businessVerifiedAt: null,
          },
        );
        await manager.update(Venue, { ownerUserId: user.id }, { cnpj: null });
        // Eventos comerciais ainda em análise eram do CNPJ apagado: deixam de ser "comerciais" pra
        // não serem publicados por engano quando um CNPJ novo for aprovado. Seguem em análise.
        const detached = await manager.update(
          Event,
          { createdBy: user.id, createdAsBusiness: true, status: EventStatus.PENDING_REVIEW },
          { createdAsBusiness: false },
        );
        console.log(`Eventos comerciais em análise desvinculados: ${detached.affected ?? 0}`);
      });
      console.log(`${email}: validação de CNPJ apagada; pode reenviar o contrato social.`);
      return;
    }
    const approve = process.argv.includes('--approve');
    const reject = process.argv.includes('--reject');
    if (!email || approve === reject) {
      throw new Error('Use --list, ou --email <email> com --approve, --reject [--note "motivo"] ou --reset');
    }

    const user = await users.findOne({ where: { email } });
    if (!user) throw new Error(`Usuário ${email} não encontrado`);

    const note = arg('note') ?? (approve ? 'Aprovado na revisão manual.' : 'Reprovado na revisão manual.');
    const result = await dataSource.transaction((manager) =>
      applyBusinessReview(manager, user.id, approve ? 'approved' : 'rejected', note),
    );
    if (approve) console.log(`Eventos publicados: ${result.publishedEvents}`);
    console.log(`${email}: ${result.user.businessVerificationStatus}`);
  } finally {
    await dataSource.destroy();
  }
}

reviewBusiness().catch((error) => {
  console.error('Business review failed:', error.message);
  process.exitCode = 1;
});
