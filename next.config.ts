import type { NextConfig } from 'next';

const API_URL = process.env.API_URL ?? 'http://localhost:3000';

const nextConfig: NextConfig = {
  // The browser only ever talks to its own origin; Next forwards these paths to the backend.
  async rewrites() {
    return [
      { source: '/api/auth/:path*', destination: `${API_URL}/api/auth/:path*` },
      { source: '/api/v1/:path*', destination: `${API_URL}/api/v1/:path*` },
    ];
  },
};

export default nextConfig;