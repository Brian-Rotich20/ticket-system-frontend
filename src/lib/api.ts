import { API_URL } from './config';
import { clearToken, getToken } from './token';

/** Our API sends { error: { code, message, details } }; Better Auth sends { code, message }. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function toApiError(res: Response): Promise<ApiError> {
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    /* not JSON */
  }
  const e = body?.error ?? body ?? {};
  return new ApiError(res.status, e.code ?? `HTTP_${res.status}`, e.message ?? (res.statusText || 'Request failed'), e.details);
}

let onUnauthorized: (() => void) | null = null;
/** The auth provider registers itself here so an expired or revoked session logs the user out everywhere. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Sent as a JSON body. */
  json?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Attach the session token (default true). Sign-in and sign-up pass false. */
  auth?: boolean;
}

/** Low-level call: returns the Response (so callers can read headers) and throws ApiError on non-2xx. */
export async function request(path: string, { method = 'GET', json, headers, signal, auth = true }: RequestOptions = {}): Promise<Response> {
  const token = auth ? getToken() : null;

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal,
      headers: {
        Accept: 'application/json',
        ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
      body: json !== undefined ? JSON.stringify(json) : undefined,
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Check your connection and try again.');
  }

  if (!res.ok) {
    if (res.status === 401 && token) {
      clearToken();
      onUnauthorized?.();
    }
    throw await toApiError(res);
  }
  return res;
}

/** JSON call. 204 and empty bodies resolve to undefined. */
export async function api<T>(path: string, options?: RequestOptions): Promise<T> {
  const res = await request(path, options);
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof ApiError && Array.isArray(err.details) && err.details.length > 0) {
    const messages = err.details.map((d: { message?: string }) => d?.message).filter(Boolean);
    if (messages.length > 0) return messages.join(' ');
  }
  return err instanceof Error ? err.message : 'Something went wrong';
}