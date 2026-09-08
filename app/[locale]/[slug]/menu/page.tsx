import { notFound } from 'next/navigation';
import { MenuPage } from '@/components/menu/menu-page';
import { getAllTenantSlugs, getTenantWithMenu } from '@/lib/queries';

export async function generateStaticParams() {
  const tenants = await getAllTenantSlugs();
  // Next.js requires at least one param (empty array = build error with
  // `output: 'export'`). At docker-build time the DB is unreachable so the
  // list is empty — use a placeholder that renders notFound(); the real
  // export is rebuilt at container start with live data.
  const slugs = tenants.length > 0 ? tenants.map((t) => t.slug) : ['__build_placeholder__'];
  const locales = ['en', 'ar'];
  return locales.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

export default async function MenuRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;

  const data = await getTenantWithMenu(slug, locale);

  if (!data) notFound();

  return <MenuPage tenant={data} locale={locale} />;
}
