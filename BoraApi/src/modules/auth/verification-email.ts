import type { MailMessage } from '../../shared/services/mail.service';
import { VERIFICATION_CODE_TTL_MINUTES } from './auth.constants';

type Language = 'pt' | 'es' | 'en';

const COPY: Record<Language, { subject: string; greeting: string; intro: string; expires: string; ignore: string }> = {
  pt: {
    subject: 'Seu código do BORA: {code}',
    greeting: 'Olá, {name}!',
    intro: 'Use este código para confirmar seu e-mail no BORA:',
    expires: 'O código vale por {minutes} minutos.',
    ignore: 'Se você não criou uma conta no BORA, ignore este e-mail.',
  },
  es: {
    subject: 'Tu código de BORA: {code}',
    greeting: '¡Hola, {name}!',
    intro: 'Usa este código para confirmar tu correo en BORA:',
    expires: 'El código es válido por {minutes} minutos.',
    ignore: 'Si no creaste una cuenta en BORA, ignora este correo.',
  },
  en: {
    subject: 'Your BORA code: {code}',
    greeting: 'Hi, {name}!',
    intro: 'Use this code to confirm your email on BORA:',
    expires: 'The code is valid for {minutes} minutes.',
    ignore: "If you didn't create a BORA account, ignore this email.",
  },
};

const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);

export function buildVerificationEmail(to: string, name: string, code: string, language: Language = 'pt'): MailMessage {
  const copy = COPY[language] ?? COPY.pt;
  const fill = (text: string) =>
    text
      // Função como substituto: um nome com `$&` não vira padrão de substituição.
      .replace('{code}', () => code)
      .replace('{name}', () => name.split(' ')[0] || name)
      .replace('{minutes}', () => String(VERIFICATION_CODE_TTL_MINUTES));

  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0f172a">
  <p style="font-size:22px;font-weight:800;margin:0 0 16px">BORA</p>
  <p style="margin:0 0 8px">${escapeHtml(fill(copy.greeting))}</p>
  <p style="margin:0 0 16px">${escapeHtml(fill(copy.intro))}</p>
  <p style="font-size:32px;font-weight:800;letter-spacing:8px;margin:0 0 16px">${code}</p>
  <p style="margin:0 0 8px;color:#475569">${escapeHtml(fill(copy.expires))}</p>
  <p style="margin:0;color:#94a3b8;font-size:12px">${escapeHtml(fill(copy.ignore))}</p>
</div>`;
  const text = [fill(copy.greeting), fill(copy.intro), code, fill(copy.expires), fill(copy.ignore)].join('\n\n');

  return { to, subject: fill(copy.subject), html, text };
}
