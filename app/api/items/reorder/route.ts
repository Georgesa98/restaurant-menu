import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

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

  return Response.json({ success: true });
}
