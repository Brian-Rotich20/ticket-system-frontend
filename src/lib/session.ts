/**
 * Browser persistence for the session token and the last active organization.
 * The token is a bearer secret: it is only ever sent to the API, never rendered or logged.
 */
export const TOKEN_KEY = 'support-desk.token';
export const ORG_KEY = 'support-desk.organization';

function read(key: string): string | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}
function write(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* storage unavailable: the value just won't persist */
  }
}

export const getToken = () => read(TOKEN_KEY);
export const setToken = (token: string) => write(TOKEN_KEY, token);
export const clearToken = () => write(TOKEN_KEY, null);

export const getLastOrganization = () => read(ORG_KEY);
export const setLastOrganization = (id: string | null) => write(ORG_KEY, id);
