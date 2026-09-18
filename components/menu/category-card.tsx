'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  activeItemCount,
  categoryCoverImage,
  CategorySlugIcon,
  resolveTranslation,
  type MenuCategory,
} from './menu-helpers';

/**
 * Kiosk-style category tile mirroring the Flutter CategoryCard:
 * photo cover on top (derived from the category's first item photo,
 * slug-icon wash fallback), name + item count + RTL-aware chevron below.
 * Whole card links to the category detail route.
 */
export function CategoryCard({
  tenantSlug,
  category,
  locale,
  isRtl,
  countLabel,
}: {
  tenantSlug: string;
  category: MenuCategory;
  locale: string;
  isRtl: boolean;
  countLabel: string;
}) {
  const catTrans = resolveTranslation(category, locale);
  const cover = categoryCoverImage(category);
  const count = activeItemCount(category);
  const Chevron = isRtl ? ChevronLeft : ChevronRight;

  return (
    <Link
      href={`/${tenantSlug}/menu/${category.slug}`}
      aria-label={catTrans.name}
      className="category-card"
    >
      <div className="category-card-cover">
        {cover ? (
          <Image
            src={cover}
            alt=""
            width={600}
            height={340}
            sizes="(max-width:900px)50vw,33vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <CategorySlugIcon slug={category.slug} size={40} className="placeholder-icon" />
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 px-3 pt-2.5 pb-3">
        <div className="flex-1 min-w-0">
          <p className="category-card-name truncate" title={catTrans.name}>
            {catTrans.name}
          </p>
          <p className="category-card-count truncate mt-0.5">
            {countLabel}
            <span className="sr-only">{` (${count})`}</span>
          </p>
        </div>
        <Chevron className="category-card-chevron" size={20} strokeWidth={1.9} />
      </div>
    </Link>
  );
}
