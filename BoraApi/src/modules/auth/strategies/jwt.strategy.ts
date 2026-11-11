import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Repository } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { JwtPayload } from '../types/jwt-payload.type';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    const user = await this.users.findOneBy({ id: payload.sub });
    if (!user?.isActive) throw new UnauthorizedException();
    if (payload.impersonatorId) {
      // Acesso de suporte: cai na hora se quem o abriu deixou de ser admin ativo.
      const admin = await this.users.findOneBy({ id: payload.impersonatorId });
      if (!admin?.isActive || admin.role !== 'admin') throw new UnauthorizedException();
    }
    return payload;
  }
}
