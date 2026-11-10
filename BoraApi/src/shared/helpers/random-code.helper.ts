import { randomInt } from 'node:crypto';

/** Letras e números sem os que se confundem ao ler ou digitar (0/O, 1/I). */
export const READABLE_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Código aleatório (gerador criptográfico) com `length` caracteres do alfabeto legível. */
export function randomReadableCode(length: number): string {
  let code = '';
  for (let i = 0; i < length; i += 1) code += READABLE_CODE_ALPHABET[randomInt(READABLE_CODE_ALPHABET.length)];
  return code;
}

export const PUBLIC_CODE_PREFIX = 'BORA-';
const PUBLIC_CODE_LENGTH = 5;

/** Código de identificação da pessoa (ex.: `BORA-7K3P9`), mostrado ao comércio na entrega do brinde. */
export function randomPublicCode(): string {
  return `${PUBLIC_CODE_PREFIX}${randomReadableCode(PUBLIC_CODE_LENGTH)}`;
}

/**
 * Normaliza o código digitado pelo comércio: maiúsculas, sem espaços nem traço, com ou sem o
 * prefixo (`7k3p9`, `bora 7K3P9` e `BORA-7K3P9` viram `BORA-7K3P9`). O alfabeto não tem "O",
 * então um código de 5 caracteres nunca começa com "BORA" por acaso.
 */
export function normalizePublicCode(raw: string): string {
  const compact = raw.toUpperCase().replace(/[^0-9A-Z]/g, '');
  const code = compact.length === 4 + PUBLIC_CODE_LENGTH && compact.startsWith('BORA') ? compact.slice(4) : compact;
  return `${PUBLIC_CODE_PREFIX}${code}`;
}
