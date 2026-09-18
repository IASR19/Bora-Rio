// Em produção, front e API vivem no mesmo deploy Vercel (same-origin) — "/api" relativo
// já resolve certo sem precisar de env var. Em dev local, o .env aponta pra localhost:3000.
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

let accessToken: string | null = null;
let csrfToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

function readCsrfCookie(): string | null {
  const match = document.cookie.match(/(?:^|; )bora_csrf=([^;]*)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public errorCode?: string,
    public fieldErrors?: { field: string; message: string }[],
  ) {
    super(message);
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
}

// Dedupe: se várias requests tomam 401 ao mesmo tempo (accessToken de 15min expirou
// no meio do uso), todas esperam o mesmo refresh em vez de disparar um cada.
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) return null;
        const data = await res.json();
        accessToken = data.accessToken ?? null;
        return accessToken;
      })
      .catch(() => null)
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

async function performRequest<T>(path: string, options: RequestOptions, allowRefresh: boolean): Promise<T> {
  const { method = 'GET', body, auth = true } = options;

  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth && accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (method !== 'GET') {
    csrfToken = csrfToken ?? readCsrfCookie();
    if (csrfToken) headers['x-csrf-token'] = csrfToken;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    credentials: 'include',
    body: body ? JSON.stringify(body) : undefined,
  });

  // Sessão ainda válida (cookie de refresh, até 10 dias) mas o accessToken de 15min
  // expirou no meio do uso — renova uma vez e repete a request original.
  if (response.status === 401 && auth && allowRefresh) {
    const newToken = await refreshAccessToken();
    if (newToken) return performRequest<T>(path, options, false);
  }

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(payload.message ?? 'Erro inesperado', response.status, payload.errorCode, payload.fieldErrors);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

export function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  return performRequest<T>(path, options, true);
}
