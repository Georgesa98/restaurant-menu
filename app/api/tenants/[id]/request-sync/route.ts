import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

const forbid = () => Response.json({ error: 'Forbidden' }, { status: 403 });

/**
 * POST /api/tenants/:id/request-sync (super-admin only).
 * Raises the poll flag (+ bumps revision so tablets treat it as new).
 * Tablets pick it up on the next 15-min poll / heartbeat / manual Sync.
 * v1 has no FCM — this is the entire "push" mechanism.
 */
export async function POST(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const { id } = await params;
  const tenant = await prisma.tenant.update({
    where: { id },
    data: { revision: { increment: 1 }, syncRequired: true },
    select: { id: true, revision: true, syncRequired: true },
  });

  return Response.json(tenant);
}

/**
 * DELETE clears the flag once the fleet is current again
 * (tablets also clear it implicitly on a successful pull — see below).
 */
export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const { id } = await params;
  const tenant = await prisma.tenant.update({
    where: { id },
    data: { syncRequired: false },
    select: { id: true, revision: true, syncRequired: true },
  });

  return Response.json(tenant);
}
