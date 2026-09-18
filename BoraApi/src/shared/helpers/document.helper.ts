/** Só confirma que o número é bem-formado (dígito verificador correto) — não
 * consulta Receita Federal nem confirma que pertence a quem está enviando. */
export function isValidCpf(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) return false;

  const checkDigit = (base: string): number => {
    let sum = 0;
    let weight = base.length + 1;
    for (const digit of base) {
      sum += Number(digit) * weight;
      weight -= 1;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = checkDigit(digits.slice(0, 9));
  const d2 = checkDigit(digits.slice(0, 9) + d1);
  return digits === `${digits.slice(0, 9)}${d1}${d2}`;
}

export function isValidCnpj(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  if (digits.length !== 14 || /^(\d)\1{13}$/.test(digits)) return false;

  const checkDigit = (base: string): number => {
    const weights =
      base.length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const sum = base.split('').reduce((acc, digit, i) => acc + Number(digit) * weights[i], 0);
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };

  const d1 = checkDigit(digits.slice(0, 12));
  const d2 = checkDigit(digits.slice(0, 12) + d1);
  return digits === `${digits.slice(0, 12)}${d1}${d2}`;
}
