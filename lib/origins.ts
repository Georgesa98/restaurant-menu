function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Single source of truth for allowed browser origins.
 * - Local dev defaults + menu production domains baked in.
 * - BETTER_AUTH_URL / NEXT_PUBLIC_APP_URL always included when set.
 * - Extra tenant custom domains via TRUSTED_ORIGINS (comma-separated, supports * wildcards).
 */
const defaults = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://menu.georgesalebe.me',
  'https://*.menu.georgesalebe.me',
];

if (process.env.BETTER_AUTH_URL) defaults.push(process.env.BETTER_AUTH_URL);
if (process.env.NEXT_PUBLIC_APP_URL) defaults.push(process.env.NEXT_PUBLIC_APP_URL);

const extra = (process.env.TRUSTED_ORIGINS ?? '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const trustedOrigins: string[] = [...new Set([...defaults, ...extra])];

export function isOriginAllowed(origin: string): boolean {
  return trustedOrigins.some((pattern) => {
    if (pattern.includes('*')) {
      const re = new RegExp(
        '^' + pattern.split('*').map(escapeRegExp).join('.*') + '$',
      );
      return re.test(origin);
    }
    return pattern === origin;
  });
}
