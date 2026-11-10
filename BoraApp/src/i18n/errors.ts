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
};

export function apiErrorSource(message: unknown, status: number, errorCode?: string): string {
  if (Array.isArray(message)) return 'Verifique os dados informados.';
  if (typeof message === 'string') {
    if (aliases[message]) return aliases[message];
    if (translations[message]) return message;
  }
  if (errorCode && codes[errorCode]) return codes[errorCode];
  if (status === 401) return 'Sua sessão expirou. Entre novamente.';
  if (status === 403) return 'Você não tem permissão para realizar esta ação.';
  if (status === 404) return 'Este registro não foi encontrado.';
  if (status === 400) return 'Verifique os dados informados.';
  return 'Não foi possível concluir a solicitação.';
}

export function translateApiError(message: unknown, status: number, errorCode?: string): string {
  return t(apiErrorSource(message, status, errorCode));
}
