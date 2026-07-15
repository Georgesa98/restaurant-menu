import { Hono } from 'hono';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

export const exportData = new Hono<{ Variables: Variables }>();

exportData.use('*', requireAuth);

exportData.get('/', async (c) => {
  const tenantId = c.req.query('tenantId');
  const userTenantId = c.get('userTenantId');
  const role = c.get('userRole');

  const effectiveTenantId = role === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return c.json({ error: 'tenantId required' }, 400);

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

  return c.json(result);
});
