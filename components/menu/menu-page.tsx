import type { TenantData } from '@/lib/types';
import { OrderMenu } from './order-menu';

export function MenuPage({
  tenant,
  locale,
  highlightCategory: _highlightCategory,
}: {
  tenant: TenantData;
  locale: string;
  highlightCategory?: string;
}) {
  return <OrderMenu tenant={tenant} locale={locale} />;
}
