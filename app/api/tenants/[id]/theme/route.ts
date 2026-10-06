import { prisma } from '@/lib/prisma';
import { menuInclude } from '@/lib/queries';
import { requireSession } from '@/lib/require-session';
import { bumpTenantRevision } from '@/lib/revision';
import { forbid } from '@/lib/user-guards';
import { themeUpdateSchema } from '@/lib/validations/tenant';

type Params = { params: Promise<{ id: string }> };

/** Super admins may edit any tenant; tenant admins only their own. */
async function guard(tenantId: string): Promise<Response | null> {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userRole, userTenantId } = r.session;
  if (userRole !== 'SUPER_ADMIN' && userTenantId !== tenantId) return forbid();
  return null;
}

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  const denied = await guard(id);
  if (denied) return denied;

  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: menuInclude(),
  });
  if (!tenant) return Response.json({ error: 'Not found' }, { status: 404 });
  return Response.json(tenant);
}

export async function PATCH(req: Request, { params }: Params) {
  const { id } = await params;
  const denied = await guard(id);
  if (denied) return denied;

  const parsed = themeUpdateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(
      { error: 'Invalid theme payload', issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const { name, description, cardStyle, menuLayout, spacing, itemStyle, defaultCategorySlug, ...tokens } = parsed.data;
  try {
    const tenant = await prisma.tenant.update({
      where: { id },
      data: {
        name,
        description: description || null,
        cardStyle,
        menuLayout,
        spacing,
        itemStyle,
        defaultCategorySlug: defaultCategorySlug || null,
        ...tokens,
      },
    });
    // Theme changes reach the tablets too (palette on the kiosk shell).
    await bumpTenantRevision(id);
    return Response.json(tenant);
  } catch {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
}
