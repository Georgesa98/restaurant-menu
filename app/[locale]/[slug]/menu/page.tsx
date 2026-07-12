import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { notFound } from "next/navigation"
import { MenuPage } from "@/components/menu/menu-page"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

export async function generateStaticParams() {
  const tenants = await prisma.tenant.findMany({
    where: { isActive: true },
    select: { slug: true },
  })

  const locales = ["en", "ar"]
  return locales.flatMap((locale) =>
    tenants.map((t) => ({ locale, slug: t.slug }))
  )
}

export default async function MenuRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>
}) {
  const { locale, slug } = await params

  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      categories: {
        include: {
          items: { include: { translations: { where: { locale } } } },
          translations: { where: { locale } },
        },
      },
    },
  })

  if (!data) notFound()

  return <MenuPage tenant={data} locale={locale} />
}
