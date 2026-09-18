import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { bumpTenantRevision } from '@/lib/revision';

type Params = { params: Promise<{ id: string; locale: string }> };

export async function PUT(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id, locale } = await params;
  const body = await req.json();

  // Parent-touch: bump Category.updatedAt so delta sync ships the parent
  // with its full translation set.
  const [result] = await prisma.$transaction([
    prisma.categoryTranslation.upsert({
      where: { categoryId_locale: { categoryId: id, locale } },
      update: { name: body.name, description: body.description ?? null },
      create: { categoryId: id, locale, name: body.name, description: body.description ?? null },
    }),
    prisma.category.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);

  const parent = await prisma.category.findUnique({ where: { id }, select: { tenantId: true } });
  if (parent) await bumpTenantRevision(parent.tenantId);

  return Response.json(result);
}

export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id, locale } = await params;
  const parent = await prisma.category.findUnique({ where: { id }, select: { tenantId: true } });
  await prisma.$transaction([
    prisma.categoryTranslation.delete({
      where: { categoryId_locale: { categoryId: id, locale } },
    }),
    prisma.category.update({ where: { id }, data: { updatedAt: new Date() } }),
  ]);
  if (parent) await bumpTenantRevision(parent.tenantId);
  return Response.json({ success: true });
}
