import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const menuItem = await prisma.menuItem.findUnique({
    where: { id },
    include: {
      translations: true,
      category: true,
      variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' } },
    },
  });
  if (!menuItem) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(menuItem);
}

export async function PUT(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const body = await req.json();

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

  return Response.json(menuItem);
}

export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  // Soft delete: tombstone for delta sync.
  await prisma.menuItem.update({
    where: { id },
    data: { isDeleted: true, updatedAt: new Date() },
  });
  return Response.json({ success: true });
}
