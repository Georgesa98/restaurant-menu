import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

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
    include: { translations: true },
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

  const cat = await prisma.category.create({
    data: {
      tenantId,
      name: body.name,
      slug: body.slug,
      description: body.description ?? null,
      displayOrder: body.displayOrder ?? 0,
    },
  });

  return Response.json(cat, { status: 201 });
}
