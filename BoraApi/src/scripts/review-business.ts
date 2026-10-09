import 'dotenv/config';

import dataSource from '../data-source';
import { Event, EventStatus } from '../modules/events/entities/event.entity';
import { BusinessVerificationStatus, User } from '../modules/users/entities/user.entity';

/**
 * Revisão manual da validação de ponto comercial (CNPJ + contrato social) que a IA deixou em análise.
 *
 *   npm run business:review -- --list
 *   npm run business:review -- --email dono@bar.com --approve
 *   npm run business:review -- --email dono@bar.com --reject --note "Contrato de outra empresa"
 *   npm run business:review -- --email dono@bar.com --reset   (apaga a validação: o usuário reenvia do zero)
 *
 * Aprovar publica os eventos que esse usuário criou como ponto comercial e estavam em análise.
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
      const pending = await users.find({ where: { businessVerificationStatus: BusinessVerificationStatus.PENDING } });
      if (!pending.length) console.log('Nenhuma validação de CNPJ em análise.');
      for (const user of pending) {
        console.log(`${user.email} | CNPJ ${user.businessCnpj} | ${user.businessName ?? '?'} | ${user.businessVerificationNote}`);
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
            businessContractFile: null,
            businessVerifiedAt: null,
          },
        );
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
    if (!user?.businessCnpj) throw new Error(`Nenhuma validação de CNPJ para ${email}`);

    await dataSource.transaction(async (manager) => {
      user.businessVerificationStatus = approve ? BusinessVerificationStatus.APPROVED : BusinessVerificationStatus.REJECTED;
      user.businessVerificationNote = arg('note') ?? (approve ? 'Aprovado na revisão manual.' : 'Reprovado na revisão manual.');
      user.businessVerifiedAt = approve ? new Date() : null;
      await manager.save(user);

      if (approve) {
        const result = await manager.update(
          Event,
          { createdBy: user.id, createdAsBusiness: true, status: EventStatus.PENDING_REVIEW },
          { status: EventStatus.PUBLISHED },
        );
        console.log(`Eventos publicados: ${result.affected ?? 0}`);
      }
    });
    console.log(`${email}: ${user.businessVerificationStatus}`);
  } finally {
    await dataSource.destroy();
  }
}

reviewBusiness().catch((error) => {
  console.error('Business review failed:', error.message);
  process.exitCode = 1;
});
