import { prisma } from './prisma';
import type { TenantData, TenantCard } from './types';

export function menuInclude() {
  return {
    categories: {
      where: { isActive: true, isDeleted: false },
      orderBy: { displayOrder: 'asc' as const },
      include: {
          items: {
            where: { isDeleted: false },
            orderBy: { displayOrder: 'asc' as const },
            include: {
              // All locales: the menu resolves the current one client-side
              // and searches across both (see lib/search.ts).
              translations: { orderBy: { locale: 'asc' as const } },
              variants: { where: { isDeleted: false }, orderBy: { sortOrder: 'asc' as const } },
            },
          },
        translations: { orderBy: { locale: 'asc' as const } },
      },
    },
  } as const;
}

export async function getActiveTenants(): Promise<TenantCard[]> {
  const rows = await prisma.tenant.findMany({
    where: { isActive: true, slug: { not: null } },
    orderBy: { name: 'asc' },
    select: {
      slug: true,
      name: true,
      description: true,
      primaryColor: true,
      domain: true,
      defaultLocale: true,
    },
  });
  return rows as TenantCard[];
}

export async function getTenantWithMenu(slug: string): Promise<TenantData | null> {
  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: menuInclude(),
  });
  if (!data) return null;
  // RSC → client boundary: Prisma returns Decimal instances and Dates, which
  // React cannot serialize. JSON round-trip turns prices into strings
  // (Decimal.toJSON) and dates into ISO strings — same shape over the wire.
  return JSON.parse(JSON.stringify(data)) as TenantData;
}

export async function getAllTenantSlugs(): Promise<{ slug: string }[]> {
  const rows = await prisma.tenant.findMany({
    where: { isActive: true, slug: { not: null } },
    select: { slug: true },
  });
  return rows as { slug: string }[];
}

export async function getAllTenantCategoryCombos(): Promise<{ slug: string; categorySlug: string }[]> {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true, slug: { not: null } },
    select: {
      slug: true,
      categories: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  });
  return tenants.flatMap((t) =>
    t.categories.map((c) => ({ slug: t.slug as string, categorySlug: c.slug })),
  );
}
