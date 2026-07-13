import { Hono } from 'hono';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

export const importData = new Hono<{ Variables: Variables }>();

importData.use('*', requireAuth);

const EN_CATEGORY_NAMES: Record<string, string> = {
  'مشروبات ساخنة': 'Hot Drinks',
  'مشروبات باردة': 'Cold Drinks',
  غربي: 'Western',
  كريبات: 'Crepes',
  شرقي: 'Eastern',
  'مشروبات كحولية': 'Alcoholic Drinks',
  بيتزا: 'Pizza',
  باريستا: 'Barista',
  'مقبلات باردة': 'Cold Appetizers',
  'مقبلات ساخنة': 'Hot Appetizers',
  سلطات: 'Salads',
  باستا: 'Pasta',
  اراكيل: 'Shisha',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

importData.post('/', async (c) => {
  const tenantId = c.req.query('tenantId');
  const userTenantId = c.get('userTenantId');
  const role = c.get('userRole');

  const effectiveTenantId = role === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return c.json({ error: 'tenantId required' }, 400);

  const body = await c.req.json();
  if (!body.categories || !Array.isArray(body.categories)) {
    return c.json({ error: 'Invalid format: categories array required' }, 400);
  }

  let catCount = 0;
  let itemCount = 0;
  let trCount = 0;
  const errors: string[] = [];

  for (const cat of body.categories) {
    try {
      const enName = EN_CATEGORY_NAMES[cat.name] ?? cat.name;
      const catSlug = slugify(enName);

      const category = await prisma.category.upsert({
        where: { tenantId_slug: { tenantId: effectiveTenantId, slug: catSlug } },
        update: { name: enName, displayOrder: cat.order ?? 0 },
        create: {
          tenantId: effectiveTenantId,
          name: enName,
          slug: catSlug,
          displayOrder: cat.order ?? 0,
        },
      });
      catCount++;

      if (cat.name !== enName) {
        await prisma.categoryTranslation.upsert({
          where: { categoryId_locale: { categoryId: category.id, locale: 'ar' } },
          update: { name: cat.name, description: cat.description ?? null },
          create: { categoryId: category.id, locale: 'ar', name: cat.name, description: cat.description ?? null },
        });
        trCount++;
      }

      if (!cat.items?.length) continue;

      for (const item of cat.items) {
        const itemName = item.nameEn ?? item.name;

        let menuItem = await prisma.menuItem.findFirst({
          where: { tenantId: effectiveTenantId, categoryId: category.id, name: itemName },
        });

        const data = {
          name: itemName,
          description: item.description ?? null,
          price: item.consumerPrice ?? item.price ?? 0,
          financialPrice: item.financialPrice ?? item.consumerPrice ?? item.price ?? 0,
          displayOrder: item.order ?? 0,
          isAvailable: item.isAvailable ?? true,
          dietaryTags: item.dietaryTags ?? [],
          categoryId: category.id,
        };

        if (menuItem) {
          await prisma.menuItem.update({ where: { id: menuItem.id }, data });
        } else {
          menuItem = await prisma.menuItem.create({
            data: { ...data, tenantId: effectiveTenantId },
          });
        }
        itemCount++;

        if (item.name) {
          await prisma.menuItemTranslation.upsert({
            where: { menuItemId_locale: { menuItemId: menuItem.id, locale: 'ar' } },
            update: { name: item.name, description: item.description ?? null },
            create: { menuItemId: menuItem.id, locale: 'ar', name: item.name, description: item.description ?? null },
          });
          trCount++;
        }

        if (item.nameEn && item.nameEn !== item.name) {
          await prisma.menuItemTranslation.upsert({
            where: { menuItemId_locale: { menuItemId: menuItem.id, locale: 'en' } },
            update: { name: item.nameEn, description: item.description ?? null },
            create: { menuItemId: menuItem.id, locale: 'en', name: item.nameEn, description: item.description ?? null },
          });
          trCount++;
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      errors.push(`Category "${cat.name}": ${msg}`);
    }
  }

  return c.json({
    imported: { categories: catCount, items: itemCount, translations: trCount },
    errors: errors.length > 0 ? errors : undefined,
  });
});
