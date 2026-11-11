import { CookieOptions, Response } from 'express';

import { ADMIN_REFRESH_TOKEN_COOKIE, IMPERSONATION_TTL_SECONDS, REFRESH_TOKEN_COOKIE } from './auth.constants';

const TEN_DAYS_MS = 10 * 24 * 60 * 60 * 1000;

function cookieOptions(maxAge: number): CookieOptions {
  return {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge,
    path: '/api/auth',
  };
}

export function setRefreshTokenCookie(res: Response, token: string, maxAge = TEN_DAYS_MS): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, cookieOptions(maxAge));
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
}

/**
 * Início do acesso de suporte: a sessão do admin vai para um cookie à parte e o cookie de
 * refresh passa a ser o da conta acessada (com o prazo curto do acesso de suporte).
 */
export function setImpersonationCookies(res: Response, adminRefreshToken: string, targetRefreshToken: string): void {
  res.cookie(ADMIN_REFRESH_TOKEN_COOKIE, adminRefreshToken, cookieOptions(TEN_DAYS_MS));
  setRefreshTokenCookie(res, targetRefreshToken, IMPERSONATION_TTL_SECONDS * 1000);
}

export function clearAdminRefreshTokenCookie(res: Response): void {
  res.clearCookie(ADMIN_REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
}
