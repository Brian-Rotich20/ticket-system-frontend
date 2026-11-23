import { vi } from 'vitest';

/** In-memory localStorage behind a minimal `window`, so session persistence works in Node. */
export function installBrowser() {
  const store = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
    clear: () => store.clear(),
  };
  vi.stubGlobal('window', { localStorage, location: { origin: 'https://app.example.test' } });
  return store;
}

export interface Captured {
  url: string;
  init: RequestInit & { headers: Record<string, string> };
}

/** Replaces fetch; every call is recorded and answered by `respond`. */
export function mockFetch(respond: (url: string, init: RequestInit) => Response | Promise<Response>) {
  const calls: Captured[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string, init: RequestInit) => {
      calls.push({ url, init: init as Captured['init'] });
      return respond(url, init);
    }),
  );
  return calls;
}

export const json = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', ...headers } });
