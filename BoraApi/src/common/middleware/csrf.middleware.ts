import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { NextFunction, Request, Response } from 'express';

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS'];
const CSRF_COOKIE = 'bora_csrf';
const CSRF_HEADER = 'x-csrf-token';

@Injectable()
export class CsrfMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    let token = req.cookies?.[CSRF_COOKIE];
    if (!token) {
      token = randomUUID();
      res.cookie(CSRF_COOKIE, token, { httpOnly: false, sameSite: 'lax' });
    }

    if (!SAFE_METHODS.includes(req.method)) {
      const headerToken = req.headers[CSRF_HEADER];
      if (!headerToken || headerToken !== token) {
        res.status(403).json({ message: 'Invalid CSRF token', errorCode: 'INVALID_CSRF_TOKEN' });
        return;
      }
    }

    next();
  }
}
