import { Response } from 'express';

import { REFRESH_TOKEN_COOKIE } from './auth.constants';

export function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie(REFRESH_TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 10 * 24 * 60 * 60 * 1000,
    path: '/api/auth',
  });
}

export function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie(REFRESH_TOKEN_COOKIE, { path: '/api/auth' });
}
