import { t } from './index';
import { translations } from './translations';

const aliases: Record<string, string> = {
  'Invalid email or password': 'E-mail ou senha inválidos.',
  'Email already registered': 'Este e-mail já está cadastrado.',
  'Invalid or expired verification code': 'Código de verificação inválido ou expirado.',
  'Invalid Google token': 'Não foi possível validar o login com Google.',
  'Google account not registered': 'Essa conta Google ainda não tem cadastro no Bora.',
  'Missing refresh token': 'Sua sessão expirou. Entre novamente.',
  Unauthorized: 'Sua sessão expirou. Entre novamente.',
  Forbidden: 'Você não tem permissão para realizar esta ação.',
  'Not Found': 'Este registro não foi encontrado.',
  'Internal server error': 'Não foi possível concluir a solicitação.',
  'Validation failed': 'Verifique os dados informados.',
};
const codes: Record<string, string> = {
  INVALID_CREDENTIALS: 'E-mail ou senha inválidos.',
  VALIDATION_ERROR: 'Verifique os dados informados.',
  RESOURCE_NOT_FOUND: 'Este registro não foi encontrado.',
  UNAUTHORIZED_OPERATION: 'Você não tem permissão para realizar esta ação.',
  INTERNAL_ERROR: 'Não foi possível concluir a solicitação.',
  EVENT_REJECTED: 'Este evento foi rejeitado e não aceita participação.',
  EMAIL_NOT_VERIFIED: 'Confirme seu e-mail para resgatar.',
};

/** Mensagens da API com valores no meio (horários): o dicionário guarda o modelo com {chaves}. */
const patterns: { regex: RegExp; template: string; keys: string[] }[] = [
  {
    regex: /^Esta promoção vale no dia do evento, das (\d{1,2}:\d{2}) às (\d{1,2}:\d{2})\.$/,
    template: 'Esta promoção vale no dia do evento, das {from} às {to}.',
    keys: ['from', 'to'],
  },
  {
    regex: /^Este brinde só pode ser resgatado das (\d{1,2}:\d{2}) às (\d{1,2}:\d{2})\.$/,
    template: 'Este brinde só pode ser resgatado das {from} às {to}.',
    keys: ['from', 'to'],
  },
  {
    regex: /^Benefício já entregue às (\d{1,2}:\d{2})\.$/,
    template: 'Benefício já entregue às {time}.',
    keys: ['time'],
  },
];

function matchPattern(message: unknown): { template: string; params: Record<string, string> } | null {
  if (typeof message !== 'string') return null;
  for (const { regex, template, keys } of patterns) {
    const match = regex.exec(message);
    if (match) return { template, params: Object.fromEntries(keys.map((key, index) => [key, match[index + 1]])) };
  }
  return null;
}

export function apiErrorSource(message: unknown, status: number, errorCode?: string): string {
  if (Array.isArray(message)) return 'Verifique os dados informados.';
  if (typeof message === 'string') {
    if (aliases[message]) return aliases[message];
    if (translations[message] || matchPattern(message)) return message;
  }
  if (errorCode && codes[errorCode]) return codes[errorCode];
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'Este registro não foi encontrado.';
  if (status === 400) return 'Verifique os dados informados.';
  return 'Não foi possível concluir a solicitação.';
}

export function translateApiError(message: unknown, status: number, errorCode?: string): string {
  const pattern = matchPattern(message);
  if (pattern) return t(pattern.template, pattern.params);
  return t(apiErrorSource(message, status, errorCode));
}
