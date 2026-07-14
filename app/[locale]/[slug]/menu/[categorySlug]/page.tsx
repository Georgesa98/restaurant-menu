import { notFound } from 'next/navigation';
import { MenuPage } from '@/components/menu/menu-page';
import { getAllTenantCategoryCombos, getTenantWithCategory } from '@/lib/queries';

export async function generateStaticParams() {
  let combos: { slug: string; categorySlug: string }[];
  try {
    combos = await getAllTenantCategoryCombos();
  } catch {
    return [];
  }
  const locales = ['en', 'ar'];
  return locales.flatMap((locale) => combos.map((c) => ({ locale, slug: c.slug, categorySlug: c.categorySlug })));
}

export default async function CategoryMenuRoute({
  params,
}: {
  params: Promise<{ locale: string; slug: string; categorySlug: string }>;
}) {
  const { locale, slug, categorySlug } = await params;

  const data = await getTenantWithCategory(slug, categorySlug, locale);

  if (!data || data.categories.length === 0) notFound();

  return <MenuPage tenant={data} locale={locale} highlightCategory={categorySlug} />;
}
