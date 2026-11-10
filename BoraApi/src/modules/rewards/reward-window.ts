const TIME_ZONE = 'America/Sao_Paulo';

const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: TIME_ZONE,
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

/** 'HH:MM' (ou 'HH:MM:SS', como o Postgres devolve coluna `time`) em minutos desde 00:00. */
function toMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/** Minutos desde 00:00 no relógio de São Paulo. */
function saoPauloMinutes(date: Date): number {
  const parts = clock.formatToParts(date);
  const part = (type: 'hour' | 'minute') => Number(parts.find((p) => p.type === type)?.value);
  return part('hour') * 60 + part('minute');
}

/** 'HH:MM' pra mensagem (corta os segundos que o Postgres devolve). */
export function formatRewardTime(time: string): string {
  return time.slice(0, 5);
}

/**
 * O horário de agora (em São Paulo) está dentro da janela de resgate do brinde?
 * Início e fim inclusivos, com precisão de minuto. Janela que atravessa a meia-noite
 * (ex.: 20:00 → 02:00) vale das 20:00 até 23:59 e de 00:00 até 02:00. Início igual ao fim
 * vale o dia todo.
 */
export function isWithinRewardWindow(validFrom: string, validUntil: string, now: Date = new Date()): boolean {
  const from = toMinutes(validFrom);
  const until = toMinutes(validUntil);
  const current = saoPauloMinutes(now);
  if (from === until) return true;
  if (from < until) return current >= from && current <= until;
  return current >= from || current <= until;
}
