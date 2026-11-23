import type { NextConfig } from 'next';

const apiOrigin = (() => {
  try {
    return new URL(process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000').origin;
  } catch {
    return '';
  }
})();
const dev = process.env.NODE_ENV !== 'production';

/**
 * Content Security Policy. Next.js needs inline scripts for hydration without nonces, so script-src keeps
 * 'unsafe-inline'; the rest locks the page down: API calls only to our backend, no plugins, no framing,
 * forms and <base> only to this origin. Business logos are arbitrary https URLs (img-src https:).
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' ${apiOrigin}${dev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

/** Pages whose URL carries a bearer secret: never leak it in a Referer, never cache or index them. */
const secretPageHeaders = [
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'Cache-Control', value: 'no-store' },
  { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
];

/** Hosts next/image may optimise: Unsplash, plus the host of NEXT_PUBLIC_HERO_IMAGE_URL when it is set. */
const imageHosts = (() => {
  const hosts = new Set(['images.unsplash.com']);
  try {
    if (process.env.NEXT_PUBLIC_HERO_IMAGE_URL) hosts.add(new URL(process.env.NEXT_PUBLIC_HERO_IMAGE_URL).hostname);
  } catch {
    /* a relative path or invalid URL needs no remote pattern */
  }
  return [...hosts];
})();

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: imageHosts.map((hostname) => ({ protocol: 'https' as const, hostname })),
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      { source: '/track/:token*', headers: secretPageHeaders },
      { source: '/accept-invitation/:token*', headers: secretPageHeaders },
    ];
  },
  /** First-version URLs keep working. */
  async redirects() {
    return [
      { source: '/dashboard', destination: '/app/dashboard', permanent: false },
      { source: '/queue', destination: '/app/tickets', permanent: false },
      { source: '/queue/:id', destination: '/app/tickets/:id', permanent: false },
      { source: '/tickets', destination: '/app/tickets', permanent: false },
      { source: '/tickets/:path*', destination: '/app/tickets/:path*', permanent: false },
      { source: '/team', destination: '/app/team', permanent: false },
      { source: '/audit', destination: '/app/audit-logs', permanent: false },
    ];
  },
};

export default nextConfig;
