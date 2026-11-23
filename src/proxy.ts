import { NextResponse, type NextRequest } from 'next/server';
import { parsePortalDomains, resolvePortalSlug } from '@/lib/portal-domains';

const domains = parsePortalDomains(process.env.PORTAL_DOMAINS);

/**
 * Serves a business's support portal on its own domain: the root of support.abcinternet.co.ke shows
 * /support/abc-internet. Tracking links (/track/...) work on any domain unchanged.
 */
export function proxy(request: NextRequest) {
  const slug = resolvePortalSlug(request.headers.get('host'), domains);
  if (!slug) return NextResponse.next();
  return NextResponse.rewrite(new URL(`/support/${slug}`, request.url));
}

export const config = { matcher: '/' };
