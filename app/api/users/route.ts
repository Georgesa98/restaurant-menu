import { auth } from '@/lib/auth-server';
import { requireSession } from '@/lib/require-session';

/**
 * Create a user (super-admin only). Used by the onboarding wizard to create
 * the tenant admin alongside the tenant.
 */
export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const { email, name, password, role, tenantId } = body as {
    email?: string;
    name?: string;
    password?: string;
    role?: string;
    tenantId?: string | null;
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
      },
    });
    return Response.json(created, { status: 201 });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return Response.json({ error: msg }, { status: 400 });
  }
}
