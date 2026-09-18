import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

const forbid = () => Response.json({ error: 'Forbidden' }, { status: 403 });

/**
 * GET /api/tenants/:id/devices — tablet fleet for one tenant.
 * Super-admin: any tenant. Tenant admin: own tenant only.
 */
export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { id } = await params;
  if (r.session.userRole !== 'SUPER_ADMIN' && r.session.userTenantId !== id) {
    return forbid();
  }

  const devices = await prisma.deviceHeartbeat.findMany({
    where: { tenantId: id },
    orderBy: { lastSeen: 'desc' },
  });
  return Response.json(devices);
}
