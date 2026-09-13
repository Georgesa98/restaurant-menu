import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { MenuPage } from '@/components/menu/menu-page';
import { getTenantWithCategory } from '@/lib/queries';

// Fully dynamic: fresh DB read per request, no rebuilds on content change.
export const dynamic = 'force-dynamic';

export default async function CategoryMenuRoute({
  params,
}: {
  params: Promise<{ slug: string; categorySlug: string }>;
}) {
  const { slug, categorySlug } = await params;
  const locale = await getLocale();

  const data = await getTenantWithCategory(slug, categorySlug, locale);

  if (!data || data.categories.length === 0) notFound();

  return <MenuPage tenant={data} locale={locale} highlightCategory={categorySlug} />;
}
