import { headers } from 'next/headers';
import { auth } from './auth-server';

export type Session = {
  userId: string;
  userTenantId: string | null;
  userRole: string;
};

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 });

/**
 * Route-handler equivalent of the old Hono `requireAuth` middleware.
 * Returns `{ session }` on success or `{ response }` (401) to return directly.
 */
export async function requireSession(): Promise<{ session: Session } | { response: Response }> {
  const data = await auth.api.getSession({ headers: await headers() });
  if (!data) return { response: unauthorized() };
  return {
    session: {
      userId: data.user.id,
      userTenantId: (data.user.tenantId as string | null) ?? null,
      userRole: data.user.role as string,
    },
  };
}
