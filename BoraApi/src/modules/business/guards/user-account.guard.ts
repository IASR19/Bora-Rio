import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';

/** Bloqueia as ações do lado "usuário" (interesse, check-in, resgate, chat, seguir, Deu Bora)
 * para contas de comércio: elas servem só para administrar o estabelecimento. */
@Injectable()
export class UserAccountGuard implements CanActivate {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id
      ? await this.users.findOne({ where: { id }, select: { id: true, accountType: true } })
      : null;
    if (user?.accountType === 'business') {
      throw new ForbiddenException(
        'Contas de estabelecimento não podem usar esta função. Crie uma conta de usuário.',
      );
    }
    return true;
  }
}
