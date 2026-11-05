const memory = new Map<string, string>();

export function readLocalStorage(key: string): string | null {
  if (memory.has(key)) return memory.get(key)!;
  try {
    return globalThis.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeLocalStorage(key: string, value: string): void {
  memory.set(key, value);
  try {
    globalThis.localStorage.setItem(key, value);
  } catch {
    /* Keep the preference for this session when storage is blocked or full. */
  }
}
