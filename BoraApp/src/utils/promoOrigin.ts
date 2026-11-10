import { readLocalStorage, writeLocalStorage } from '@/utils/storage';

const KEY = 'bora:promo-origin';
const MAX_AGE_MS = 24 * 60 * 60 * 1000;

export function savePromoOrigin(code: string) {
  writeLocalStorage(KEY, JSON.stringify({ code, at: Date.now() }));
}

/** Devolve o código salvo (se tiver menos de 24 h) e apaga a chave. */
export function takePromoOrigin(): string | null {
  const raw = readLocalStorage(KEY);
  if (!raw) return null;
  writeLocalStorage(KEY, '');
  try {
    const { code, at } = JSON.parse(raw) as { code?: string; at?: number };
    if (code && typeof at === 'number' && Date.now() - at < MAX_AGE_MS) return code;
  } catch {
    /* origem corrompida: ignora */
  }
  return null;
}
