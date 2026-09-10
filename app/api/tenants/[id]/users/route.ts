import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await params;
  const users = await prisma.user.findMany({
    where: { tenantId: id },
    orderBy: { createdAt: 'desc' },
  });

  return Response.json(users);
}
