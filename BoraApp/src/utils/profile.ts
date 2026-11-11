export function isProfileComplete(user: {
  accountType?: 'user' | 'business';
  birthDate: string | null;
  phone: string | null;
  city: string | null;
  cpf?: string | null;
}) {
  if (user.accountType === 'business') return true;
  return Boolean(user.birthDate && user.phone && user.city && user.cpf);
}

/** Conta sem e-mail confirmado vai para a tela de verificação; o acesso de suporte entra direto,
 * porque o código só chega no e-mail do dono da conta. */
export function needsEmailVerification(user: { emailVerified: boolean; impersonation?: unknown }) {
  return !user.emailVerified && !user.impersonation;
}
