export const REFRESH_TOKEN_COOKIE = 'bora_refresh_token';
/** Guarda a sessão do próprio admin enquanto ele acessa a conta de outra pessoa (modo suporte). */
export const ADMIN_REFRESH_TOKEN_COOKIE = 'bora_admin_refresh_token';
/** Duração máxima de um acesso de suporte; o refresh não estende esse prazo. */
export const IMPERSONATION_TTL_SECONDS = 2 * 60 * 60;
export const VERIFICATION_CODE_TTL_MINUTES = 10;
/** Espera mínima entre dois envios do código por e-mail. */
export const EMAIL_CODE_COOLDOWN_SECONDS = 60;
/** Tentativas erradas antes de o código ser invalidado. */
export const EMAIL_CODE_MAX_ATTEMPTS = 5;
/** Idade mínima pra usar o app — nightlife/bebida (escopo.md princípio de produto). */
export const MIN_AGE = 18;
