import { QueryFailedError } from 'typeorm';

const POSTGRES_UNIQUE_VIOLATION = '23505';

/** Corrida entre duas requisições concorrentes tentando criar a mesma linha
 * (protegida por índice único) — trate como "já existe", não como erro. */
export function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof QueryFailedError &&
    (err as unknown as { driverError?: { code?: string } }).driverError?.code === POSTGRES_UNIQUE_VIOLATION
  );
}
