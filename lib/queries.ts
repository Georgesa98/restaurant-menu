import { prisma } from "./prisma"
import type { TenantData, TenantCard } from "./types"

function menuInclude(locale: string) {
  return {
    categories: {
      include: {
        items: { include: { translations: { where: { locale } } } },
        translations: { where: { locale } },
      },
    },
  } as const
}

export async function getActiveTenants(): Promise<TenantCard[]> {
  return prisma.tenant.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      description: true,
      primaryColor: true,
      domain: true,
      defaultLocale: true,
    },
  })
}

export async function getTenantWithMenu(
  slug: string,
  locale: string
): Promise<TenantData | null> {
  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: menuInclude(locale),
  })
  return data as TenantData | null
}

export async function getTenantWithCategory(
  slug: string,
  categorySlug: string,
  locale: string
): Promise<TenantData | null> {
  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { slug: categorySlug, isActive: true },
        include: {
          items: { include: { translations: { where: { locale } } } },
          translations: { where: { locale } },
        },
      },
    },
  })
  return data as TenantData | null
}

export async function getAllTenantSlugs(): Promise<{ slug: string }[]> {
  return prisma.tenant.findMany({
    where: { isActive: true },
    select: { slug: true },
  })
}

export async function getAllTenantCategoryCombos(): Promise<
  { slug: string; categorySlug: string }[]
> {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    select: {
      slug: true,
      categories: {
        where: { isActive: true },
        select: { slug: true },
      },
    },
  })
  return tenants.flatMap((t) =>
    t.categories.map((c) => ({ slug: t.slug, categorySlug: c.slug }))
  )
}
