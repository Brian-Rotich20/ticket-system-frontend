/**
 * Custom support-portal domains, e.g. support.abcinternet.co.ke -> organization "abc-internet".
 *
 * The backend does not store custom domains yet (there is no domain -> organization lookup endpoint), so the
 * mapping is configured on the frontend deployment:
 *   PORTAL_DOMAINS="support.abcinternet.co.ke=abc-internet,help.shop.co.ke=shop"
 * When the backend gains a domain lookup, only resolvePortalSlug needs to change.
 */
export function parsePortalDomains(raw: string | undefined): Map<string, string> {
  const map = new Map<string, string>();
  for (const pair of (raw ?? '').split(',')) {
    const [host, slug] = pair.split('=').map((s) => s?.trim().toLowerCase());
    if (host && slug && /^[a-z0-9.-]+$/.test(host) && /^[a-z0-9-]+$/.test(slug)) map.set(host, slug);
  }
  return map;
}

/** The organization whose portal is served on this host, if any. Ports are ignored. */
export function resolvePortalSlug(host: string | null, domains: Map<string, string>): string | null {
  if (!host) return null;
  return domains.get(host.toLowerCase().replace(/:\d+$/, '')) ?? null;
}
