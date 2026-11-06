/** Error from either backend: our API sends { error: { code, message, details } }, Better Auth sends { code, message }. */
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

interface ApiInit {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  /** Sent as a JSON body. */
  json?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

/** Plain fetch against the same-origin proxy. Sends the session cookie, throws ApiError on non-2xx. */
export async function api<T>(path: string, { method = 'GET', json, headers, signal }: ApiInit = {}): Promise<T> {
  const res = await fetch(path, {
    method,
    credentials: 'include',
    signal,
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });
  if (!res.ok) throw await toApiError(res);
  const text = await res.text(); // 204 and empty bodies yield undefined
  return (text ? JSON.parse(text) : undefined) as T;
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}