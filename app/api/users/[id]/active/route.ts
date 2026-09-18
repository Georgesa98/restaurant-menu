import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { requireSuper, guardSuperAdminChange } from '@/lib/user-guards';

type Params = { params: Promise<{ id: string }> };

/**
 * Deactivate / reactivate a user (super-admin only).
 * Deactivation also wipes all sessions, so the user is logged out
 * everywhere immediately.
 */
export async function POST(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  const isActive = body.isActive !== false;

  const blocked = await guardSuperAdminChange(r.session.userId, {
    targetId: id,
    nextActive: isActive,
  });
  if (blocked) return blocked;

  const user = await prisma.user.update({
    where: { id },
    data: { isActive },
  }).catch((e: unknown) => {
    if ((e as { code?: string })?.code === 'P2025') return null;
    throw e;
  });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });

  if (!isActive) {
    await prisma.session.deleteMany({ where: { userId: id } });
  }
  return Response.json(user);
}
