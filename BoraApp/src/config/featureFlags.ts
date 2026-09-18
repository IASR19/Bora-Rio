/**
 * Feature flags controladas por variável de ambiente (VITE_FEATURE_*).
 * Em dev/teste, "false" pula a etapa — nunca hardcode o bypass direto na tela.
 */
function readFlag(value: string | undefined, defaultValue: boolean): boolean {
  if (value === undefined) return defaultValue;
  return value !== 'false';
}

export const featureFlags = {
  /** Confirmação do número por SMS no cadastro (escopo.md #4.3). */
  phoneVerification: readFlag(import.meta.env.VITE_FEATURE_PHONE_VERIFICATION, true),
  /** "Continuar com Apple" no login (escopo.md #4.1) — ainda não implementado. */
  appleLogin: readFlag(import.meta.env.VITE_FEATURE_APPLE_LOGIN, false),
};

/** Client ID do Google (tipo "Web application", console.cloud.google.com/apis/credentials). */
export const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
