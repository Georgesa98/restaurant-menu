import { prisma } from './prisma';
import type { TenantData, TenantCard } from './types';

// NOTE: `next build` (docker build) runs with no DB available — postgres isn't
// running yet and the builder has no DB network access. These queries must NOT
// throw at build time; they return empty results instead. The real static
// export is rebuilt at container start (entrypoint.sh) with the DB reachable.

async function safe<T>(fn: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await fn();
  } catch {
    console.warn(`[build-fallback] ${label}: DB unreachable, using empty result`);
    return fallback;
  }
}

function menuInclude(locale: string) {
  return {
    categories: {
      include: {
          items: {
            include: {
              translations: { where: { locale } },
              variants: { orderBy: { sortOrder: 'asc' } },
            },
          },
        translations: { where: { locale } },
      },
    },
  } as const;
}

export async function getActiveTenants(): Promise<TenantCard[]> {
  return safe(async () => {
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
  }, [] as TenantCard[], 'getActiveTenants');
}

export async function getTenantWithMenu(slug: string, locale: string): Promise<TenantData | null> {
  return safe(async () => {
    const data = await prisma.tenant.findUnique({
      where: { slug },
      include: menuInclude(locale),
    });
    return data as TenantData | null;
  }, null, `getTenantWithMenu(${slug})`);
}

export async function getTenantWithCategory(
  slug: string,
  categorySlug: string,
  locale: string,
): Promise<TenantData | null> {
  return safe(async () => {
    const data = await prisma.tenant.findUnique({
      where: { slug },
      include: {
        categories: {
          where: { slug: categorySlug, isActive: true },
          include: {
          items: {
            include: {
              translations: { where: { locale } },
              variants: { orderBy: { sortOrder: 'asc' } },
            },
          },
            translations: { where: { locale } },
          },
        },
      },
    });
    return data as TenantData | null;
  }, null, `getTenantWithCategory(${slug}/${categorySlug})`);
}

export async function getAllTenantSlugs(): Promise<{ slug: string }[]> {
  return safe(async () => {
    const rows = await prisma.tenant.findMany({
      where: { isActive: true, slug: { not: null } },
      select: { slug: true },
    });
    return rows as { slug: string }[];
  }, [], 'getAllTenantSlugs');
}

export async function getAllTenantCategoryCombos(): Promise<{ slug: string; categorySlug: string }[]> {
  return safe(async () => {
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
  }, [], 'getAllTenantCategoryCombos');
}
