const url = (process.env.NEXT_PUBLIC_API_URL ?? '').replace(/\/+$/, '');

if (!url && process.env.NODE_ENV === 'production') {
  throw new Error('NEXT_PUBLIC_API_URL is not set (the backend URL, e.g. https://xxx.onrender.com).');
}

export const API_URL = url || 'http://localhost:3000';