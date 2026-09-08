import { Hono } from 'hono';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../middleware/auth';

export const translations = new Hono();

translations.use('*', requireAuth);

// --- Category translations ---

translations.get('/categories/:id', async (c) => {
  const id = c.req.param('id');
  const result = await prisma.categoryTranslation.findMany({
    where: { categoryId: id },
  });
  return c.json(result);
});

translations.put('/categories/:id/:locale', async (c) => {
  const { id, locale } = c.req.param();
  const body = await c.req.json();

  // Parent-touch: bump Category.updatedAt so delta sync ships the parent
  // with its full translation set (docs/PLAN.md §18).
  const [result] = await prisma.$transaction([
    prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: id, locale } },
      update: { name: body.name, description: body.description ?? null },
      create: { categoryId: id, locale, name: body.name, description: body.description ?? null },
    }),
    prisma.category.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  return c.json(result);
});

translations.delete('/categories/:id/:locale', async (c) => {
  const { id, locale } = c.req.param();
  await prisma.$transaction([
    prisma.categoryTranslation.delete({
      where: { categoryId_locale: { categoryId: id, locale } },
    }),
    prisma.category.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
  return c.json({ success: true });
});

// --- MenuItem translations ---

translations.get('/items/:id', async (c) => {
  const id = c.req.param('id');
  const result = await prisma.menuItemTranslation.findMany({
    where: { menuItemId: id },
  });
  return c.json(result);
});

translations.put('/items/:id/:locale', async (c) => {
  const { id, locale } = c.req.param();
  const body = await c.req.json();

  // Parent-touch: bump MenuItem.updatedAt so delta sync ships the parent
  // with its full translation set (docs/PLAN.md §18).
  const [result] = await prisma.$transaction([
    prisma.menuItemTranslation.upsert({
      where: { menuItemId_locale: { menuItemId: id, locale } },
      update: { name: body.name, description: body.description ?? null },
      create: { menuItemId: id, locale, name: body.name, description: body.description ?? null },
    }),
    prisma.menuItem.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  return c.json(result);
});

translations.delete('/items/:id/:locale', async (c) => {
  const { id, locale } = c.req.param();
  await prisma.$transaction([
    prisma.menuItemTranslation.delete({
      where: { menuItemId_locale: { menuItemId: id, locale } },
    }),
    prisma.menuItem.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
  return c.json({ success: true });
});
