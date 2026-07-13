import { Hono } from 'hono';
import { prisma } from '../../lib/prisma';
import { requireAuth } from '../middleware/auth';
import type { Variables } from '../types';

export const tenants = new Hono<{ Variables: Variables }>();

tenants.use('*', requireAuth);

tenants.get('/', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const search = c.req.query('search') ?? '';

  const all = await prisma.tenant.findMany({
    where: search ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { categories: true, items: true } } },
  });

  return c.json(all);
});

tenants.get('/:id', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const id = c.req.param('id');
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { _count: { select: { categories: true, items: true } } },
  });
  if (!tenant) return c.json({ error: 'Not found' }, 404);

  return c.json(tenant);
});

tenants.get('/:id/users', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const id = c.req.param('id');
  const users = await prisma.user.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: 'desc' },
  });

  return c.json(users);
});

tenants.post('/', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const body = await c.req.json();

  const tenant = await prisma.tenant.create({
    data: {
      name: body.name,
      slug: body.slug,
      domain: body.domain ?? null,
      plan: body.plan ?? 'FREE',
      isActive: body.isActive ?? true,
      defaultLocale: body.defaultLocale ?? 'en',
      availableLocales: body.availableLocales ?? ['en'],
      primaryColor: body.primaryColor ?? '#e74c3c',
      secondaryColor: body.secondaryColor ?? '#2c3e50',
      accentColor: body.accentColor ?? '#f39c12',
      backgroundColor: body.backgroundColor ?? '#fdf5e6',
      surfaceColor: body.surfaceColor ?? '#ffffff',
      textColor: body.textColor ?? '#1a1a2e',
      textMuted: body.textMuted ?? '#64748b',
      headingFont: body.headingFont ?? 'Georgia, serif',
      bodyFont: body.bodyFont ?? 'Inter, system-ui, sans-serif',
      description: body.description ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
    },
  });

  return c.json(tenant, 201);
});

tenants.put('/:id', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const id = c.req.param('id');
  const body = await c.req.json();

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      domain: body.domain,
      plan: body.plan,
      isActive: body.isActive,
      defaultLocale: body.defaultLocale,
      availableLocales: body.availableLocales,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      surfaceColor: body.surfaceColor,
      textColor: body.textColor,
      textMuted: body.textMuted,
      headingFont: body.headingFont,
      bodyFont: body.bodyFont,
      description: body.description,
      address: body.address,
      phone: body.phone,
    },
  });

  return c.json(tenant);
});

tenants.delete('/:id', async (c) => {
  const role = c.get('userRole');
  if (role !== 'SUPER_ADMIN') return c.json({ error: 'Forbidden' }, 403);

  const id = c.req.param('id');
  await prisma.tenant.delete({ where: { id } });
  return c.json({ success: true });
});
