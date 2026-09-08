import { Hono } from 'hono';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

export const items = new Hono<{ Variables: Variables }>();

items.use('*', requireAuth);

items.get('/', async (c) => {
  const tenantId = c.req.query('tenantId');
  const categoryId = c.req.query('categoryId');
  const userTenantId = c.get('userTenantId');
  const role = c.get('userRole');

  const effectiveTenantId = role === 'SUPER_ADMIN' ? tenantId : userTenantId;
  if (!effectiveTenantId) return c.json({ error: 'tenantId required' }, 400);

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

  return c.json(menuItems);
});

items.get('/:id', async (c) => {
  const id = c.req.param('id');
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      translations: true,
      category: true,
      variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!menuItem) return c.json({ error: 'Not found' }, 404);
  return c.json(menuItem);
});

items.post('/', async (c) => {
  const body = await c.req.json();
  const userTenantId = c.get('userTenantId');
  const role = c.get('userRole');

  const tenantId = role === 'SUPER_ADMIN' ? body.tenantId : userTenantId;
  if (!tenantId) return c.json({ error: 'tenantId required' }, 400);

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

  return c.json(menuItem, 201);
});

items.put('/:id', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  // replace variants atomically: tombstone the old set (delta sync removes
  // them on tablets via the parent's new updatedAt), then create the new set
  await prisma.menuItemVariant.updateMany({
    where: { menuItemId: id, isDeleted: false },
    data: { isDeleted: true },
  });

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: {
      categoryId: body.categoryId,
      name: body.name,
      description: body.description,
      basePrice: body.basePrice,
      imageUrl: body.imageUrl,
      isAvailable: body.isAvailable,
      displayOrder: body.displayOrder,
      dietaryTags: body.dietaryTags,
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

  return c.json(menuItem);
});

items.delete('/:id', async (c) => {
  const id = c.req.param('id');
  // Soft delete: tombstone for delta sync (docs/PLAN.md §18).
  await prisma.menuItem.update({
    where: { id },
    data: { isDeleted: true, updatedAt: new Date() },
  });
  return c.json({ success: true });
});

items.patch('/reorder', async (c) => {
  const body = await c.req.json();
  const { items: reorderItems } = body as { items: { id: string; displayOrder: number }[] };

  await prisma.$transaction(
    reorderItems.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  return c.json({ success: true });
});

items.patch('/:id/availability', async (c) => {
  const id = c.req.param('id');
  const body = await c.req.json();

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: body.isAvailable },
  });

  return c.json(menuItem);
});
