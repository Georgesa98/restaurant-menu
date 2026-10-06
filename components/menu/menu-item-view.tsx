'use client';

import { ItemCard } from './item-card';
import { ItemLine } from './item-line';
import type { MenuItem } from './menu-helpers';

/** Renders a dish as a photo card or a leader-line text row, per tenant.itemStyle. */
export function MenuItemView({
  item,
  categorySlug,
  locale,
  addLabel,
  featuredLabel,
  itemStyle,
}: {
  item: MenuItem;
  categorySlug: string;
  locale: string;
  addLabel: string;
  featuredLabel: string;
  itemStyle?: string;
}) {
  if (itemStyle === 'text') {
    return <ItemLine item={item} locale={locale} addLabel={addLabel} featuredLabel={featuredLabel} />;
  }
  return (
    <ItemCard
      item={item}
      categorySlug={categorySlug}
      locale={locale}
      addLabel={addLabel}
      featuredLabel={featuredLabel}
    />
  );
}
