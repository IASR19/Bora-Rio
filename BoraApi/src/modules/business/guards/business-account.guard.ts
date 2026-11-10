import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { BusinessVerificationStatus, User } from '../../users/entities/user.entity';

export const BUSINESS_ONLY_MESSAGE = 'Disponível apenas para estabelecimentos aprovados.';

/** Só deixa passar conta de comércio já aprovada pelo admin. Busca a conta no banco a cada
 * pedido (como o AdminGuard): o token não carrega tipo nem status, que mudam na aprovação. */
@Injectable()
export class BusinessAccountGuard implements CanActivate {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id
      ? await this.users.findOne({
          where: { id },
          select: { id: true, isActive: true, accountType: true, businessVerificationStatus: true },
        })
      : null;
    if (
      !user?.isActive ||
      user.accountType !== 'business' ||
      user.businessVerificationStatus !== BusinessVerificationStatus.APPROVED
    ) {
      throw new ForbiddenException(BUSINESS_ONLY_MESSAGE);
    }
    return true;
  }
}
