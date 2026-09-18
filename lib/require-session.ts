import { headers } from 'next/headers';
import { auth } from './auth-server';
import { prisma } from './prisma';

export type Session = {
  userId: string;
  userTenantId: string | null;
  userRole: string;
};

const unauthorized = () => Response.json({ error: 'Unauthorized' }, { status: 401 });
const forbidden = () => Response.json({ error: 'Account deactivated' }, { status: 403 });

/**
 * Route-handler equivalent of the old Hono `requireAuth` middleware.
 * Returns `{ session }` on success or `{ response }` (401/403) to return directly.
 *
 * Role/tenant/active are read authoritatively from the DB (not session claims)
 * so deactivation and role changes take effect immediately.
 */
export async function requireSession(): Promise<{ session: Session } | { response: Response }> {
  const data = await auth.api.getSession({ headers: await headers() });
  if (!data) return { response: unauthorized() };
  const user = await prisma.user.findUnique({
    where: { id: data.user.id },
    select: { isActive: true, role: true, tenantId: true },
  });
  if (!user) return { response: unauthorized() };
  if (!user.isActive) return { response: forbidden() };
  return {
    session: {
      userId: data.user.id,
      userTenantId: user.tenantId,
      userRole: user.role,
    },
  };
}
