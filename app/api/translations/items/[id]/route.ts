import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;

  const { id } = await params;
  const result = await prisma.menuItemTranslation.findMany({
    where: { menuItemId: id },
  });
  return Response.json(result);
}
