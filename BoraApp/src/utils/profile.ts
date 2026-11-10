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
