import 'dotenv/config';

import { EntityManager } from 'typeorm';

import dataSource from '../data-source';
import { AdminAudit } from '../modules/admin/entities/admin-audit.entity';
import { Gender, User } from '../modules/users/entities/user.entity';

export const ADMIN_EMAIL = 'admin@bora.com';
// Bootstrap password is stored only as a bcrypt hash. Repeated seeds never reset it.
const INITIAL_PASSWORD_HASH = '$2b$10$9vIwkcGK4WtbHDWYc7mifeQOMqduNASSTarZk..7insvMoJ/FXrLS';

export async function ensureAdmin(manager: EntityManager): Promise<User> {
  await manager.query('SELECT pg_advisory_xact_lock(70190431)');
  const repository = manager.getRepository(User);
  const existing = await repository.findOne({ where: { email: ADMIN_EMAIL }, withDeleted: true });
  if (existing) {
    if (existing.deletedAt || existing.role !== 'admin') {
      throw new Error(
        'O e-mail do seed já pertence a uma conta removida ou sem perfil de administrador. Nenhum dado foi alterado.',
      );
    }
    return existing;
  }
  const user = await repository.save(
    repository.create({
      name: 'Administrador',
      email: ADMIN_EMAIL,
      passwordHash: INITIAL_PASSWORD_HASH,
      role: 'admin',
      isActive: true,
      language: 'pt',
      gender: Gender.UNDISCLOSED,
      birthDate: null,
      phone: null,
      phoneVerified: false,
      city: null,
    }),
  );
  await manager.save(AdminAudit, {
    actorId: user.id,
    targetId: user.id,
    action: 'user.bootstrap',
    changes: { role: 'admin', source: 'seed:admin' },
  });
  return user;
}

export async function seedAdmin(): Promise<void> {
  await dataSource.initialize();
  try {
    await dataSource.transaction(ensureAdmin);
    console.log('Conta administrativa disponível. O seed preserva senha e dados de contas já criadas.');
  } finally {
    await dataSource.destroy();
  }
}

if (require.main === module) {
  seedAdmin().catch((error) => {
    console.error('Admin seed failed:', error.message);
    process.exitCode = 1;
  });
}
