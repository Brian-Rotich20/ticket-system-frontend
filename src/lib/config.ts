const url = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

if (!url && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL is not set (the backend URL, e.g. https://xxx.onrender.com).');
}

/** Backend base URL (inlined at build time). */
export const API_URL = url || 'http://localhost:3000';

/** Render's free tier can take up to a minute to wake up, so the default timeout is generous. */
export const REQUEST_TIMEOUT_MS = 60_000;
export const UPLOAD_TIMEOUT_MS = 120_000;
