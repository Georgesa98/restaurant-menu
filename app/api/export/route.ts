import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

export async function GET(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const tenantId = new URL(req.url).searchParams.get('tenantId');
  const effectiveTenantId = userRole === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  const categories = await prisma.category.findMany({
    where: { tenantId: effectiveTenantId },
    orderBy: { displayOrder: 'asc' },
    include: {
      translations: true,
      items: {
        orderBy: { displayOrder: 'asc' },
        include: { translations: true, variants: { orderBy: { sortOrder: 'asc' } } },
      },
    },
  });

  const result = {
    categories: categories.map((cat) => ({
      name: cat.name,
      order: cat.displayOrder,
      translations: Object.fromEntries(
        cat.translations.map((t) => [t.locale, { name: t.name, description: t.description }]),
      ),
      items: cat.items.map((item) => ({
        name: item.name,
        description: item.description,
        basePrice: item.basePrice ? Number(item.basePrice) : null,
        imageUrl: item.imageUrl,
        order: item.displayOrder,
        isAvailable: item.isAvailable,
        dietaryTags: item.dietaryTags,
        variants: item.variants.map((v) => ({
          label: v.label,
          labelEn: v.labelEn,
          price: Number(v.price),
          sortOrder: v.sortOrder,
        })),
        translations: Object.fromEntries(
          item.translations.map((t) => [t.locale, { name: t.name, description: t.description }]),
        ),
      })),
    })),
  };

  return Response.json(result);
}
