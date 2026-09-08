import { notFound } from 'next/navigation';
import { MenuPage } from '@/components/menu/menu-page';
import { getAllTenantCategoryCombos, getTenantWithCategory } from '@/lib/queries';

export async function generateStaticParams() {
  const combos = await getAllTenantCategoryCombos();
  // Same as menu/page.tsx: never return [] (build error with `output:
  // 'export'`). Placeholder renders notFound(); rebuilt with live data at start.
  const list =
    combos.length > 0
      ? combos
      : [{ slug: '__build_placeholder__', categorySlug: '__build_placeholder__' }];
  const locales = ['en', 'ar'];
  return locales.flatMap((locale) => list.map((c) => ({ locale, slug: c.slug, categorySlug: c.categorySlug })));
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
