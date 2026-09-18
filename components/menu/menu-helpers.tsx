'use client';

import {
  Coffee,
  CupSoda,
  Beef,
  Croissant,
  Flame,
  Wine,
  Pizza,
  Salad,
  Soup,
  Cookie,
  UtensilsCrossed,
  Wind,
  type LucideIcon,
} from 'lucide-react';
import type { TenantData, WithTranslations } from '@/lib/types';

export type MenuCategory = TenantData['categories'][number];
export type MenuItem = MenuCategory['items'][number];

export type OrderedEntry = {
  key: string;
  itemId: string;
  variantId?: string;
  label: string;
  price: number;
  categoryName: string;
};

export function resolveTranslation(
  entry: WithTranslations<{ name: string; description: string | null }>,
  locale: string,
): { name: string; description: string | null } {
  const tr = entry.translations?.find((x) => x.locale === locale) ?? entry.translations?.[0];
  return {
    name: tr?.name ?? entry.name,
    description: tr?.description ?? entry.description,
  };
}

export function formatPrice(price: number, locale: string): string {
  const n = new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
  return locale === 'ar' ? `${n} ل.س` : `SYP ${n}`;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'hot-drinks': Coffee,
  'cold-drinks': CupSoda,
  western: Beef,
  crepes: Croissant,
  oriental: Flame,
  'alcoholic-drinks': Wine,
  pizza: Pizza,
  barista: Coffee,
  'cold-appetizers': Salad,
  'hot-appetizers': Soup,
  salads: Salad,
  pasta: Soup,
  hookah: Wind,
  desserts: Cookie,
};

export function categoryIcon(slug: string): LucideIcon {
  return CATEGORY_ICONS[slug] ?? UtensilsCrossed;
}

/**
 * Static icon component (module-scope lookup, no render-time creation —
 * satisfies react-hooks/static-components).
 */
export function CategorySlugIcon({
  slug,
  size = 36,
  strokeWidth = 1.2,
  className,
}: {
  slug: string;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const Icon: LucideIcon = CATEGORY_ICONS[slug] ?? UtensilsCrossed;
  return <Icon size={size} strokeWidth={strokeWidth} className={className} />;
}

/**
 * Category cover: first available item photo by displayOrder.
 * Categories have no image column of their own, so the cover is derived.
 */
export function categoryCoverImage(category: MenuCategory): string | null {
  const withPhoto = category.items
    .filter((i) => i.isAvailable && i.imageUrl)
    .sort((a, b) => a.displayOrder - b.displayOrder);
  return withPhoto[0]?.imageUrl ?? null;
}

export function activeItemCount(category: MenuCategory): number {
  return category.items.filter((i) => i.isAvailable).length;
}
