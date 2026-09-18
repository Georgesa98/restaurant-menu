import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { bumpTenantRevision } from '@/lib/revision';

export async function PATCH(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const body = await req.json();
  const { items: reorderItems } = body as { items: { id: string; displayOrder: number }[] };

  await prisma.$transaction(
    reorderItems.map((item) =>
      prisma.menuItem.update({
        where: { id: item.id },
        data: { displayOrder: item.displayOrder },
      }),
    ),
  );

  if (reorderItems.length > 0) {
    const first = await prisma.menuItem.findUnique({
      where: { id: reorderItems[0].id },
      select: { tenantId: true },
    });
    if (first) await bumpTenantRevision(first.tenantId);
  }

  return Response.json({ success: true });
}
