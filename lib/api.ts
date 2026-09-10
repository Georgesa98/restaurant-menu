import axios from 'axios';

export const api = axios.create({
  // Same-origin: the Next.js server handles /api/* — no absolute host.
  baseURL: '',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});
