import { t } from '@/i18n';

// Em base64 o arquivo cresce 4/3 e precisa caber no limite de envio da API (4 MB).
export const MAX_CONTRACT_BYTES = 2.5 * 1024 * 1024;
export const ACCEPTED_CONTRACT_TYPES = 'application/pdf,image/jpeg,image/png,image/webp';

export function formatCnpj(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 14);
  return digits
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

export function formatCpf(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  return digits
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

export function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error(t('Não foi possível ler o arquivo.')));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}
