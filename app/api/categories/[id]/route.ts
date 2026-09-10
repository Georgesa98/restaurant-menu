import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const cat = await prisma.category.findUnique({
    where: { id },
    include: { translations: true },
  });
  if (!cat) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(cat);
}

export async function PUT(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const body = await req.json();

  const cat = await prisma.category.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      displayOrder: body.displayOrder,
      isActive: body.isActive,
    },
  });

  return Response.json(cat);
}

export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const now = new Date();
  // Soft delete: flag + tombstone, cascade the flag to items so delta sync
  // removes them on tablets. Hard purge is super-admin only.
  await prisma.$transaction([
    prisma.category.update({ where: { id }, data: { isDeleted: true, updatedAt: now } }),
    prisma.menuItem.updateMany({
      where: { categoryId: id, isDeleted: false },
      data: { isDeleted: true, updatedAt: now },
    }),
  ]);
  return Response.json({ success: true });
}
