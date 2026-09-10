import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

const forbid = () => Response.json({ error: 'Forbidden' }, { status: 403 });

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const { id } = await params;
  const tenant = await prisma.tenant.findUnique({
    where: { id },
    include: { _count: { select: { categories: true, items: true } } },
  });
  if (!tenant) return Response.json({ error: 'Not found' }, { status: 404 });

  return Response.json(tenant);
}

export async function PUT(req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const { id } = await params;
  const body = await req.json();

  const tenant = await prisma.tenant.update({
    where: { id },
    data: {
      name: body.name,
      slug: body.slug,
      domain: body.domain,
      plan: body.plan,
      isActive: body.isActive,
      defaultLocale: body.defaultLocale,
      availableLocales: body.availableLocales,
      primaryColor: body.primaryColor,
      secondaryColor: body.secondaryColor,
      accentColor: body.accentColor,
      backgroundColor: body.backgroundColor,
      surfaceColor: body.surfaceColor,
      textColor: body.textColor,
      textMuted: body.textMuted,
      headingFont: body.headingFont,
      bodyFont: body.bodyFont,
      borderRadiusSm: body.borderRadiusSm,
      borderRadiusMd: body.borderRadiusMd,
      borderRadiusLg: body.borderRadiusLg,
      shadow: body.shadow,
      cardStyle: body.cardStyle,
      menuLayout: body.menuLayout,
      spacing: body.spacing,
      customCss: body.customCss,
      logoUrl: body.logoUrl,
      coverUrl: body.coverUrl,
      description: body.description,
      address: body.address,
      phone: body.phone,
      instagram: body.instagram,
      website: body.website,
    },
  });

  return Response.json(tenant);
}

export async function DELETE(_req: Request, { params }: Params) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const { id } = await params;
  await prisma.tenant.delete({ where: { id } });
  return Response.json({ success: true });
}
