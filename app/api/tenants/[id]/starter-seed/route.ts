import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

const STARTER = [
  {
    name: 'Starters',
    nameAr: 'مقبلات',
    slug: 'starters',
    items: [
      { name: 'Sample starter', nameAr: 'مقبلات تجريبية', price: 500 },
    ],
  },
  {
    name: 'Mains',
    nameAr: 'أطباق رئيسية',
    slug: 'mains',
    items: [
      { name: 'Sample main dish', nameAr: 'طبق رئيسي تجريبي', price: 1200 },
    ],
  },
];

/**
 * Seed a minimal starter menu for a fresh tenant (super-admin only, used by
 * the onboarding wizard). Refuses when the tenant already has categories.
 */
export async function POST(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { _count: { select: { categories: true } } },
  });
  if (!tenant) return Response.json({ error: 'Tenant not found' }, { status: 404 });
  if (tenant._count.categories > 0) {
    return Response.json({ error: 'Tenant already has categories' }, { status: 409 });
  }

  const locale = tenant.defaultLocale ?? 'en';
  let itemCount = 0;

  for (const [ci, cat] of STARTER.entries()) {
    const category = await prisma.category.create({
      data: {
        tenantId: id,
        name: cat.name,
        slug: cat.slug,
        displayOrder: ci,
      },
    });
    await prisma.categoryTranslation.create({
      data: { categoryId: category.id, locale: 'ar', name: cat.nameAr },
    });
    for (const [ii, item] of cat.items.entries()) {
      const created = await prisma.menuItem.create({
        data: {
          tenantId: id,
          categoryId: category.id,
          name: item.name,
          basePrice: item.price,
          displayOrder: ii,
          dietaryTags: [],
        },
      });
      await prisma.menuItemTranslation.createMany({
        data: [
          { menuItemId: created.id, locale: 'ar', name: item.nameAr },
          ...(locale !== 'ar' ? [{ menuItemId: created.id, locale, name: item.name }] : []),
        ],
      });
      itemCount++;
    }
  }

  return Response.json({ success: true, categories: STARTER.length, items: itemCount }, { status: 201 });
}
