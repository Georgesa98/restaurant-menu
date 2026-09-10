import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

export async function GET(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const search = new URL(req.url).searchParams;
  const tenantId = search.get('tenantId');
  const categoryId = search.get('categoryId');

  const effectiveTenantId = userRole === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  const menuItems = await prisma.menuItem.findMany({
    where: {
      tenantId: effectiveTenantId,
      isDeleted: false,
      ...(categoryId ? { categoryId } : {}),
    },
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: true,
      category: true,
      variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } },
    },
  });

  return Response.json(menuItems);
}

export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const body = await req.json();
  const tenantId = userRole === 'SUPER_ADMIN' ? body.tenantId : userTenantId;
  if (!tenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  const menuItem = await prisma.menuItem.create({
    data: {
      tenantId,
      categoryId: body.categoryId,
      name: body.name,
      description: body.description ?? null,
      basePrice: body.basePrice ?? null,
      imageUrl: body.imageUrl ?? null,
      isAvailable: body.isAvailable ?? true,
      displayOrder: body.displayOrder ?? 0,
      dietaryTags: body.dietaryTags ?? [],
      ...(body.variants?.length
        ? {
            variants: {
              create: body.variants.map((v: any, i: number) => ({
                label: v.label,
                labelEn: v.labelEn ?? v.label,
                price: v.price,
                sortOrder: i,
              })),
            },
          }
        : {}),
    },
  });

  return Response.json(menuItem, { status: 201 });
}
