import { prisma } from '@/lib/prisma';
import { auth } from '@/lib/auth-server';
import { requireSession } from '@/lib/require-session';
import { requireSuper } from '@/lib/user-guards';

/**
 * List all users (super-admin only). Powers the admin Users view.
 * Supports ?search= (username, name, email) and ?tenantId= filters.
 */
export async function GET(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const search = new URL(req.url).searchParams;
  const q = search.get('search') ?? '';
  const tenantId = search.get('tenantId');

  const users = await prisma.user.findMany({
    where: {
      ...(tenantId ? { tenantId } : {}),
      ...(q
        ? {
            OR: [
              { username: { contains: q, mode: 'insensitive' } },
              { name: { contains: q, mode: 'insensitive' } },
              { email: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
  // No Prisma relation from User → Tenant; attach names manually.
  const tenantIds = [...new Set(users.map((u) => u.tenantId).filter((t): t is string => !!t))];
  const tenants = tenantIds.length
    ? await prisma.tenant.findMany({
        where: { id: { in: tenantIds } },
        select: { id: true, name: true, slug: true },
      })
    : [];
  const byId = new Map(tenants.map((t) => [t.id, t]));

  return Response.json(users.map((u) => ({ ...u, tenant: u.tenantId ? (byId.get(u.tenantId) ?? null) : null })));
}

/**
 * Create a user (super-admin only). Used by the onboarding wizard to create
 * the tenant admin alongside the tenant, and by the admin Users view.
 */
export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const denied = requireSuper(r.session);
  if (denied) return denied;

  const body = await req.json();
  const { email, name, password, role, tenantId, username } = body as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    tenantId?: string | null;
    username?: string;
  };

  if (!email || !name || !password) {
    return Response.json({ error: 'email, name and password are required' }, { status: 400 });
  }
  if (role !== 'SUPER_ADMIN' && !tenantId) {
    return Response.json({ error: 'tenantId required for tenant users' }, { status: 400 });
  }

  try {
    const created = await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
        role: role ?? 'TENANT_ADMIN',
        tenantId: tenantId ?? null,
        ...(username ? { username } : {}),
      },
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const status = /username|taken|unique|duplicate/i.test(msg) ? 409 : 400;
    return Response.json({ error: msg }, { status });
  }
}
