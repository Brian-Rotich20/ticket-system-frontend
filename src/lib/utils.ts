/** Only allow same-site relative paths as post-login redirects (no open redirects). */
export function safeNext(value: string | null | undefined, fallback = '/dashboard'): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) return fallback;
  return value;
}

export const cx = (
  ...classes: (string | false | null | undefined)[]
): string => {
  return classes.filter(Boolean).join(" ");
};