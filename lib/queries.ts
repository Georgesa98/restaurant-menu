import { prisma } from './prisma';
import type { TenantData, TenantCard } from './types';

function menuInclude() {
  return {
    categories: {
      include: {
          items: {
            include: {
              // All locales: the menu resolves the current one client-side
              // and searches across both (see lib/search.ts).
              translations: { orderBy: { locale: 'asc' } },
              variants: { orderBy: { sortOrder: 'asc' } },
            },
          },
        translations: { orderBy: { locale: 'asc' } },
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
  return data as TenantData | null;
}

export async function getTenantWithCategory(
  slug: string,
  categorySlug: string,
): Promise<TenantData | null> {
  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { slug: categorySlug, isActive: true },
        include: {
        items: {
          include: {
            translations: { orderBy: { locale: 'asc' } },
            variants: { orderBy: { sortOrder: 'asc' } },
          },
        },
          translations: { orderBy: { locale: 'asc' } },
        },
      },
    },
  });
  return data as TenantData | null;
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
