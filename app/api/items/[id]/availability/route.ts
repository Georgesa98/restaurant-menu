import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const body = await req.json();

  const menuItem = await prisma.menuItem.update({
    where: { id },
    data: { isAvailable: body.isAvailable },
  });

  return Response.json(menuItem);
}
