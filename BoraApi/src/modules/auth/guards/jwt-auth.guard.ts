import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Rotas @Public() ainda tentam autenticar (para @CurrentUser() poder
 * personalizar quando há token válido), mas nunca bloqueiam nem lançam
 * quando não há usuário — só rotas protegidas exigem token.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  private isPublicHandler(context: ExecutionContext): boolean {
    return Boolean(
      this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [context.getHandler(), context.getClass()]),
    );
  }

  handleRequest<TUser = unknown>(err: unknown, user: TUser, info: unknown, context: ExecutionContext): TUser {
    if (this.isPublicHandler(context)) return (user ?? null) as TUser;
    if (err || !user) throw err ?? new UnauthorizedException();
    return user;
  }
}
