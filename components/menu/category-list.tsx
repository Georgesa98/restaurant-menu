import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { activeItemCount, resolveTranslation, type MenuCategory } from './menu-helpers';

/**
 * Text list of categories — replaces the image-card grid so the menu never
 * depends on having photos. On phones/tablet-portrait it sits above the
 * selected category's items; at ≥900px it becomes the persistent sidebar.
 *
 * Click behavior is chosen by the parent: buttons switch selection inline
 * (MenuHome), links navigate to the category route (CategoryDetail).
 */
export function CategoryList({
  categories,
  locale,
  selectedSlug,
  tenantSlug,
  isRtl,
  countLabel,
  allLabel,
  onSelect,
}: {
  categories: MenuCategory[];
  locale: string;
  selectedSlug?: string;
  tenantSlug?: string;
  isRtl: boolean;
  countLabel: (count: number) => string;
  allLabel?: string;
  onSelect?: (slug: string) => void;
}) {
  const Chevron = isRtl ? ChevronLeft : ChevronRight;
  const total = categories.reduce((n, c) => n + activeItemCount(c), 0);

  return (
    <nav className="category-list" aria-label="Categories">
      {allLabel &&
        (tenantSlug ? (
          <Link
            href={`/${tenantSlug}/menu`}
            aria-current={selectedSlug === 'all' ? 'page' : undefined}
            className={`category-list-item${selectedSlug === 'all' ? ' active' : ''}`}
          >
            <span className="category-list-name">{allLabel}</span>
            <span className="category-list-count">{countLabel(total)}</span>
            <Chevron className="category-list-chevron" size={18} strokeWidth={1.9} />
          </Link>
        ) : (
          <button
            type="button"
            aria-pressed={selectedSlug === 'all'}
            className={`category-list-item${selectedSlug === 'all' ? ' active' : ''}`}
            onClick={() => onSelect?.('all')}
          >
            <span className="category-list-name">{allLabel}</span>
            <span className="category-list-count">{countLabel(total)}</span>
            <Chevron className="category-list-chevron" size={18} strokeWidth={1.9} />
          </button>
        ))}
      {categories.map((category) => {
        const catTrans = resolveTranslation(category, locale);
        const count = activeItemCount(category);
        const active = category.slug === selectedSlug;
        const className = `category-list-item${active ? ' active' : ''}`;
        const inner = (
          <>
            <span className="category-list-name">{catTrans.name}</span>
            <span className="category-list-count">{countLabel(count)}</span>
            <Chevron className="category-list-chevron" size={18} strokeWidth={1.9} />
          </>
        );

        return tenantSlug ? (
          <Link
            key={category.id}
            href={`/${tenantSlug}/menu/${category.slug}`}
            aria-current={active ? 'page' : undefined}
            className={className}
          >
            {inner}
          </Link>
        ) : (
          <button
            key={category.id}
            type="button"
            aria-pressed={active}
            className={className}
            onClick={() => onSelect?.(category.slug)}
          >
            {inner}
          </button>
        );
      })}
    </nav>
  );
}
