import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { MenuPage } from "@/components/menu/menu-page"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function generateStaticParams() {
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

  const locales = ["en", "ar"]
  return locales.flatMap((locale) =>
    tenants.flatMap((t) =>
      t.categories.map((c) => ({ locale, slug: t.slug, categorySlug: c.slug }))
    )
  )
}

export default async function CategoryMenuRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string; categorySlug: string }>
}) {
  const { locale, slug, categorySlug } = await params

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

  if (!data || data.categories.length === 0) notFound()

  return <MenuPage tenant={data} locale={locale} highlightCategory={categorySlug} />
}
