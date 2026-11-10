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

const calendar = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE });

const wallClock = new Intl.DateTimeFormat('en-CA', {
  timeZone: TIME_ZONE,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hourCycle: 'h23',
});

/** 'YYYY-MM-DD' no calendário de São Paulo (en-CA formata exatamente assim). */
export function saoPauloDate(date: Date): string {
  return calendar.format(date);
}

/** 'HH:MM' de um instante no relógio de São Paulo (ex.: "Benefício já entregue às 22:14"). */
export function formatSaoPauloClock(date: Date): string {
  return clock.format(date);
}

function addDays(date: string, days: number): string {
  const [year, month, day] = date.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + days)).toISOString().slice(0, 10);
}

/** O instante em que o relógio de São Paulo marca `time` no dia `date` (calcula o fuso do dia,
 * sem supor -03:00 fixo). */
function saoPauloInstant(date: string, time: string): Date {
  const [year, month, day] = date.split('-').map(Number);
  const naive = Date.UTC(year, month - 1, day, 0, toMinutes(time));
  const parts = wallClock.formatToParts(new Date(naive));
  const part = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((p) => p.type === type)?.value);
  const wall = Date.UTC(part('year'), part('month') - 1, part('day'), part('hour'), part('minute'), part('second'));
  return new Date(naive - (wall - naive));
}

/**
 * Hoje é dia do evento, para a promoção? Vale se, em São Paulo:
 * - a data de agora é a data de início do evento (se a janela atravessa a meia-noite, só a
 *   partir de `validFrom`: a madrugada do próprio dia é a véspera, não o evento); ou
 * - a janela da promoção atravessa a meia-noite e agora é o dia seguinte, antes do fim da janela; ou
 * - o evento tem fim e agora está entre o início e o fim (evento de vários dias).
 */
export function isRewardEventDay(
  event: { startsAt: Date; endsAt: Date | null },
  validFrom: string,
  validUntil: string,
  now: Date = new Date(),
): boolean {
  const today = saoPauloDate(now);
  const eventDay = saoPauloDate(event.startsAt);
  const current = saoPauloMinutes(now);
  const crossesMidnight = toMinutes(validFrom) > toMinutes(validUntil);
  if (today === eventDay && (!crossesMidnight || current >= toMinutes(validFrom))) return true;
  if (crossesMidnight && today === addDays(eventDay, 1) && current <= toMinutes(validUntil)) return true;
  return Boolean(event.endsAt && now >= event.startsAt && now <= event.endsAt);
}

/**
 * Fim da janela em curso: a próxima vez (a partir de agora) que o relógio de São Paulo marca
 * `validUntil`, até o último segundo desse minuto (o fim da janela é inclusivo por minuto, como
 * em `isWithinRewardWindow`). Janela que atravessa a meia-noite, lida antes da meia-noite, termina
 * no dia seguinte.
 */
export function rewardWindowEnd(validUntil: string, now: Date = new Date()): Date {
  const lastMs = 60 * 1000 - 1;
  const today = saoPauloDate(now);
  const end = saoPauloInstant(today, validUntil).getTime() + lastMs;
  if (end >= now.getTime()) return new Date(end);
  return new Date(saoPauloInstant(addDays(today, 1), validUntil).getTime() + lastMs);
}
