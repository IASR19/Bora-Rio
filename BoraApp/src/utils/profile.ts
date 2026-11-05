export function isProfileComplete(user: { birthDate: string | null; phone: string | null; city: string | null }) {
  return Boolean(user.birthDate && user.phone && user.city);
}
