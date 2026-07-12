import { notFound } from "next/navigation"
import { MenuPage } from "@/components/menu/menu-page"
import { getAllTenantSlugs, getTenantWithMenu } from "@/lib/queries"

export async function generateStaticParams() {
  const tenants = await getAllTenantSlugs()
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

  const data = await getTenantWithMenu(slug, locale)

  if (!data) notFound()

  return <MenuPage tenant={data} locale={locale} />
}
