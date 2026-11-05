import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(@InjectRepository(User) private readonly users: Repository<User>) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const id = context.switchToHttp().getRequest().user?.sub;
    const user = id ? await this.users.findOneBy({ id }) : null;
    if (!user?.isActive || user.role !== 'admin') throw new ForbiddenException('Acesso exclusivo de administradores.');
    if (!user.birthDate || !user.phone || !user.city) {
      throw new ForbiddenException('Complete seu cadastro antes de acessar a administração.');
    }
    return true;
  }
}
