import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { bumpTenantRevision } from '@/lib/revision';

export async function GET(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const tenantId = new URL(req.url).searchParams.get('tenantId');
  const effectiveTenantId = userRole === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  const cats = await prisma.category.findMany({
    where: { tenantId: effectiveTenantId, isDeleted: false },
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: true,
      // Cover for the admin list: first photographed item. Cheap by design.
      items: {
        where: { isDeleted: false, imageUrl: { not: null } },
        orderBy: { displayOrder: 'asc' },
        take: 1,
        select: { imageUrl: true },
      },
    },
  });

  return Response.json(cats);
}

export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const body = await req.json();
  const tenantId = userRole === 'SUPER_ADMIN' ? body.tenantId : userTenantId;
  if (!tenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  // Sort order is drag-and-drop owned now (dialogs no longer send it):
  // new categories append at the end unless an explicit order is given
  // (e.g. import preserving source order).
  const maxOrder =
    body.displayOrder ??
    (((await prisma.category.aggregate({ where: { tenantId }, _max: { displayOrder: true } }))
      ._max.displayOrder ??
      -1) +
      1);

  const cat = await prisma.category.create({
    data: {
      tenantId,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      displayOrder: maxOrder,
    },
  });

  await bumpTenantRevision(tenantId);

  return Response.json(cat, { status: 201 });
}
