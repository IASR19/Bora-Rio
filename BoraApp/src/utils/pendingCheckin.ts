const KEY = 'bora:pending-checkin';

export function savePendingCheckin(path: string): void {
  try {
    globalThis.sessionStorage.setItem(KEY, path);
  } catch {
    /* sessionStorage can be blocked; the guest just opens the link again. */
  }
}

/** Lê e apaga o caminho de check-in salvo antes do login. */
export function takePendingCheckin(): string | null {
  try {
    const path = globalThis.sessionStorage.getItem(KEY);
    if (path) globalThis.sessionStorage.removeItem(KEY);
    return path && path.startsWith('/checkin/') ? path : null;
  } catch {
    return null;
  }
}
