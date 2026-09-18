import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { MenuPage } from '@/components/menu/menu-page';
import { getTenantWithMenu } from '@/lib/queries';

// Fully dynamic: fresh DB read per request, no rebuilds on content change.
export const dynamic = 'force-dynamic';

export default async function MenuRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();

  const data = await getTenantWithMenu(slug);

  if (!data) notFound();

  return <MenuPage tenant={data} locale={locale} />;
}
