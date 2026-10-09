import 'reflect-metadata';

import type { VercelRequest, VercelResponse } from '@vercel/node';

import { createApp } from '../src/bootstrap';

type ExpressHandler = (req: VercelRequest, res: VercelResponse) => void;

/** Validação de ponto comercial (BrasilAPI + IA, ver BusinessVerificationService) leva até ~28 s;
 * o padrão da Vercel é 10 s no Hobby. Com `builds` no vercel.json não dá pra usar `functions`,
 * então o limite vai aqui (ou em Settings > Functions no painel). */
export const config = { maxDuration: 30 };

/**
 * Cacheia o app Nest (e o pool de conexões do TypeORM) entre invocações "quentes"
 * da mesma instância de function — evita recriar a conexão com o banco a cada
 * request. Só recria em cold start.
 */
let cachedHandler: Promise<ExpressHandler> | null = null;

async function bootstrapHandler(): Promise<ExpressHandler> {
  const app = await createApp();
  await app.init();
  return app.getHttpAdapter().getInstance();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (!cachedHandler) {
    cachedHandler = bootstrapHandler();
  }
  const expressApp = await cachedHandler;
  expressApp(req, res);
}
