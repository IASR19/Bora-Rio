const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';

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

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
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

  if (!response.ok) {
    const payload = await response.json().catch(() => ({ message: response.statusText }));
    throw new ApiError(payload.message ?? 'Erro inesperado', response.status, payload.errorCode, payload.fieldErrors);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}
