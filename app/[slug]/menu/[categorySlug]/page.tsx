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
  return tenants.flatMap((t) =>
    t.categories.map((c) => ({ slug: t.slug, categorySlug: c.slug }))
  )
}

export default async function CategoryMenuRoute({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>
}) {
  const { slug, categorySlug } = await params

  const data = await prisma.tenant.findUnique({
    where: { slug },
    include: {
      categories: {
        where: { slug: categorySlug, isActive: true },
        include: { items: true },
      },
    },
  })

  if (!data || data.categories.length === 0) notFound()

  return <MenuPage tenant={data} highlightCategory={categorySlug} />
}
