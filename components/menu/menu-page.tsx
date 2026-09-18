import type { TenantData } from '@/lib/types';
import { MenuHome } from './menu-home';
import { CategoryDetail } from './category-detail';

export function MenuPage({
  tenant,
  locale,
  highlightCategory,
}: {
  tenant: TenantData;
  locale: string;
  highlightCategory?: string;
}) {
  if (highlightCategory) {
    return (
      <CategoryDetail tenant={tenant} locale={locale} categorySlug={highlightCategory} />
    );
  }
  return <MenuHome tenant={tenant} locale={locale} />;
}
