import { requireSession } from '@/lib/require-session';

/**
 * Current caller (any authenticated, active user). Used by the admin
 * AuthProvider to enforce deactivation client-side: requireSession rejects
 * inactive accounts, so this 403s for them and the UI routes to login.
 */
export async function GET() {
  const r = await requireSession();
  if ('response' in r) return r.response;
  return Response.json({ userId: r.session.userId, role: r.session.userRole });
}
