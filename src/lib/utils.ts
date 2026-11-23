export const DEFAULT_AFTER_LOGIN = '/app/dashboard';

/**
 * Only same-site relative paths are allowed as post-login redirects (no open redirects).
 * Rejects protocol-relative URLs ("//evil.com"), backslash tricks ("/\evil.com", which browsers read as
 * "//evil.com") and control characters, then double-checks the resolved URL stays on this origin.
 */
export function safeNext(value: string | null | undefined, fallback = DEFAULT_AFTER_LOGIN): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  if (/[\\\u0000-\u001f\u007f]/.test(value)) return fallback;
  try {
    const base = 'https://app.invalid';
    const resolved = new URL(value, base);
    if (resolved.origin !== base) return fallback;
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}

export const cx = (...classes: (string | false | null | undefined)[]): string => classes.filter(Boolean).join(' ');

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatDay(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { dateStyle: 'medium' });
}

/** "3 min ago", "yesterday", or a date for anything older than a week. */
export function timeAgo(iso: string, now = Date.now()): string {
  const seconds = Math.round((now - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return formatDay(iso);
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
export const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;
