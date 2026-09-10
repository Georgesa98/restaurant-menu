import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

const forbid = () => Response.json({ error: 'Forbidden' }, { status: 403 });

export async function GET(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const search = new URL(req.url).searchParams.get('search') ?? '';

  const all = await prisma.tenant.findMany({
    where: search ? { OR: [{ name: { contains: search } }, { slug: { contains: search } }] } : undefined,
    orderBy: { createdAt: 'desc' },
    include: { _count: { select: { categories: true, items: true } } },
  });

  return Response.json(all);
}

export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  if (r.session.userRole !== 'SUPER_ADMIN') return forbid();

  const body = await req.json();

  const tenant = await prisma.tenant.create({
    data: {
      name: body.name,
      slug: body.slug,
      domain: body.domain ?? null,
      plan: body.plan ?? 'FREE',
      isActive: body.isActive ?? true,
      defaultLocale: body.defaultLocale ?? 'en',
      availableLocales: body.availableLocales ?? ['en'],
      primaryColor: body.primaryColor ?? '#e74c3c',
      secondaryColor: body.secondaryColor ?? '#2c3e50',
      accentColor: body.accentColor ?? '#f39c12',
      backgroundColor: body.backgroundColor ?? '#fdf5e6',
      surfaceColor: body.surfaceColor ?? '#ffffff',
      textColor: body.textColor ?? '#1a1a2e',
      textMuted: body.textMuted ?? '#64748b',
      headingFont: body.headingFont ?? 'Georgia, serif',
      bodyFont: body.bodyFont ?? 'Inter, system-ui, sans-serif',
      borderRadiusSm: body.borderRadiusSm ?? '4px',
      borderRadiusMd: body.borderRadiusMd ?? '8px',
      borderRadiusLg: body.borderRadiusLg ?? '16px',
      shadow: body.shadow ?? '0 2px 8px rgba(0,0,0,0.08)',
      cardStyle: body.cardStyle ?? 'elevated',
      menuLayout: body.menuLayout ?? 'single',
      spacing: body.spacing ?? 'comfortable',
      customCss: body.customCss ?? null,
      logoUrl: body.logoUrl ?? null,
      coverUrl: body.coverUrl ?? null,
      description: body.description ?? null,
      address: body.address ?? null,
      phone: body.phone ?? null,
      instagram: body.instagram ?? null,
      website: body.website ?? null,
    },
  });

  return Response.json(tenant, { status: 201 });
}
