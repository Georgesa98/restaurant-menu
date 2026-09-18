import { hashPassword } from 'better-auth/crypto';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';
import { requireSuper } from '@/lib/user-guards';

type Params = { params: Promise<{ id: string }> };

/** Reset a user's password (super-admin only). */
export async function POST(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const { id } = await params;
  const body = await req.json();
  if (!body.password || String(body.password).length < 8) {
    return Response.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { id },
    include: { accounts: { where: { providerId: 'credential' } } },
  });
  if (!user) return Response.json({ error: 'Not found' }, { status: 404 });

  const hashed = await hashPassword(String(body.password));
  const cred = user.accounts[0];
  if (cred) {
    await prisma.account.update({ where: { id: cred.id }, data: { password: hashed } });
  } else {
    await prisma.account.create({
      data: { userId: id, accountId: id, providerId: 'credential', password: hashed },
    });
  }
  return Response.json({ success: true });
}
