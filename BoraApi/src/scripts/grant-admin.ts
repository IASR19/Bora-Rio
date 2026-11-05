import 'dotenv/config';

import dataSource from '../data-source';
import { AdminAudit } from '../modules/admin/entities/admin-audit.entity';
import { User } from '../modules/users/entities/user.entity';

async function main() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email || !email.includes('@')) throw new Error('Use: npm run admin:grant -- email@dominio.com');
  await dataSource.initialize();
  try {
    await dataSource.transaction(async (manager) => {
      await manager.query('SELECT pg_advisory_xact_lock(70190431)');
      const user = await manager
        .getRepository(User)
        .createQueryBuilder('u')
        .where('LOWER(u.email) = :email', { email })
        .getOne();
      if (!user) throw new Error('Cadastre a conta na aplicação antes de atribuir o perfil de administrador.');
      if (!user.isActive) throw new Error('A conta precisa estar ativa.');
      if (user.role === 'admin') {
        console.log('A conta já é administradora.');
        return;
      }
      user.role = 'admin';
      await manager.save(user);
      await manager.save(AdminAudit, {
        actorId: user.id,
        targetId: user.id,
        action: 'user.bootstrap',
        changes: { role: 'admin', source: 'admin:grant CLI' },
      });
      console.log('Perfil de administrador atribuído. Acesse /admin na aplicação.');
    });
  } finally {
    await dataSource.destroy();
  }
}
main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
