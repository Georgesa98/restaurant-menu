import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { bumpTenantRevision } from '@/lib/revision';

export async function PATCH(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const body = await req.json().catch(() => null);
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x: unknown) => typeof x === 'string') : [];
  if (!ids.length || typeof body?.isAvailable !== 'boolean') {
    return Response.json({ error: 'ids and isAvailable required' }, { status: 400 });
  }

  const items = await prisma.menuItem.findMany({
    where: { id: { in: ids } },
    select: { id: true, tenantId: true },
  });
  const allowed = items.filter(
    (i) => userRole === 'SUPER_ADMIN' || i.tenantId === userTenantId,
  );
  if (!allowed.length) return Response.json({ error: 'Not found' }, { status: 404 });

  await prisma.menuItem.updateMany({
    where: { id: { in: allowed.map((i) => i.id) } },
    data: { isAvailable: body.isAvailable },
  });
  for (const tid of new Set(allowed.map((i) => i.tenantId))) {
    await bumpTenantRevision(tid);
  }
  return Response.json({ updated: allowed.length });
}
