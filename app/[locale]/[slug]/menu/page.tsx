import { notFound } from 'next/navigation';
import { MenuPage } from '@/components/menu/menu-page';
import { getTenantWithMenu } from '@/lib/queries';

// Fully dynamic: fresh DB read per request, no rebuilds on content change.
export const dynamic = 'force-dynamic';

export default async function MenuRoute({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params;

  const data = await getTenantWithMenu(slug, locale);

  if (!data) notFound();

  return <MenuPage tenant={data} locale={locale} />;
}
