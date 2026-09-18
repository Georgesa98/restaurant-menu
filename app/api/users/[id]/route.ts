import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { requireSuper, guardSuperAdminChange } from '@/lib/user-guards';

type Params = { params: Promise<{ id: string }> };

/** Update a user (super-admin only): name, username, role, tenant. */
export async function PATCH(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();

  const blocked = await guardSuperAdminChange(r.session.userId, {
    targetId: id,
    nextRole: body.role,
  });
  if (blocked) return blocked;

  try {
    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.username !== undefined ? { username: body.username || null } : {}),
        ...(body.role !== undefined ? { role: body.role } : {}),
        ...(body.tenantId !== undefined ? { tenantId: body.tenantId } : {}),
      },
    });
    return Response.json(user);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if ((e as { code?: string })?.code === 'P2002' || /unique|duplicate|taken/i.test(msg)) {
      return Response.json({ error: 'Username or email is already taken' }, { status: 409 });
    }
    if ((e as { code?: string })?.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    return Response.json({ error: msg }, { status: 400 });
  }
}

/** Hard delete a user (super-admin only). Sessions + accounts cascade. */
export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const { id } = await params;
  const blocked = await guardSuperAdminChange(r.session.userId, { targetId: id, hardDelete: true });
  if (blocked) return blocked;

  try {
    await prisma.user.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (e) {
    if ((e as { code?: string })?.code === 'P2025') {
      return Response.json({ error: 'Not found' }, { status: 404 });
    }
    throw e;
  }
}
