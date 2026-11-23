import { API_URL, REQUEST_TIMEOUT_MS } from '@/lib/config';
import { clearToken, getToken } from '@/lib/session';

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

type ErrorBody = { error?: { code?: string; message?: string; details?: unknown }; code?: string; message?: string; details?: unknown };

async function toApiError(res: Response): Promise<ApiError> {
  let body: ErrorBody | null = null;
  try {
    body = (await res.json()) as ErrorBody;
  } catch {
    /* not JSON */
  }
  const e = body?.error ?? body ?? {};
  return new ApiError(res.status, e.code ?? `HTTP_${res.status}`, e.message ?? (res.statusText || 'Request failed'), e.details);
}

/**
 * Who a request is for:
 *   org     signed-in user acting in the active organization (sends X-Organization-Id) — the default
 *   user    signed-in user, no organization (e.g. listing the user's organizations, auth routes)
 *   public  no credentials at all (tracking links, invitations, public business info)
 */
export type Scope = 'org' | 'user' | 'public';

let activeOrganizationId: string | null = null;
/** Set by the organization provider; every org-scoped request carries it. */
export function setActiveOrganization(id: string | null) {
  activeOrganizationId = id;
}

let onUnauthorized: (() => void) | null = null;
/** The auth provider registers itself here so an expired or revoked session logs the user out everywhere. */
export function setUnauthorizedHandler(fn: (() => void) | null) {
  onUnauthorized = fn;
}

export interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Sent as a JSON body. */
  json?: unknown;
  /** Sent as multipart/form-data; the browser sets the Content-Type with its boundary. */
  formData?: FormData;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  scope?: Scope;
  timeoutMs?: number;
}

/** Low-level call: returns the Response (so callers can read headers) and throws ApiError on non-2xx. */
export async function request(path: string, options: RequestOptions = {}): Promise<Response> {
  const { method = 'GET', json, formData, headers, signal, scope = 'org', timeoutMs = REQUEST_TIMEOUT_MS } = options;
  const token = scope === 'public' ? null : getToken();

  const h: Record<string, string> = { Accept: 'application/json' };
  if (json !== undefined) h['Content-Type'] = 'application/json';
  if (token) h.Authorization = `Bearer ${token}`;
  if (scope === 'org') {
    if (!activeOrganizationId) throw new ApiError(0, 'NO_ORGANIZATION', 'Select an organization first.');
    h['X-Organization-Id'] = activeOrganizationId;
  }

  // one controller for both the caller's cancellation and the timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  const cancel = () => controller.abort();
  signal?.addEventListener('abort', cancel);

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      method,
      signal: controller.signal,
      cache: 'no-store',
      headers: { ...h, ...headers },
      body: formData ?? (json !== undefined ? JSON.stringify(json) : undefined),
    });
  } catch (err) {
    if (signal?.aborted) throw err;
    if (controller.signal.aborted) throw new ApiError(0, 'TIMEOUT', 'The server took too long to respond. Please try again.');
    throw new ApiError(0, 'NETWORK', 'Cannot reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', cancel);
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

export const isApiError = (err: unknown, status?: number, code?: string): err is ApiError =>
  err instanceof ApiError && (status === undefined || err.status === status) && (code === undefined || err.code === code);

/** Builds a query string, skipping empty values. */
export function query(params: Record<string, string | number | boolean | undefined | null>): string {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) if (v !== undefined && v !== null && v !== '') qs.set(k, String(v));
  const s = qs.toString();
  return s ? `?${s}` : '';
}
