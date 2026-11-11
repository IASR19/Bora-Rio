import { ForbiddenException } from '@nestjs/common';

import { JwtPayload } from './types/jwt-payload.type';

/** Ações que só o dono da conta pode fazer (senha, identidade, confirmar e-mail, excluir conta)
 * ficam fora do acesso de suporte. */
export function assertNotImpersonating(user: JwtPayload): void {
  if (user.impersonatorId) {
    throw new ForbiddenException('Esta ação não está disponível durante o acesso de suporte.');
  }
}

/** Quem responde por uma ação administrativa: o admin real, mesmo acessando a conta de outro admin. */
export function realActorId(user: JwtPayload): string {
  return user.impersonatorId ?? user.sub;
}
