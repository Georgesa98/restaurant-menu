'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { TenantData } from '@/lib/types';
import { searchRank } from '@/lib/search';
import { resolveTranslation } from './menu-helpers';
import { useOrderCart } from './use-order-cart';
import { MenuTheme } from './menu-theme';
import { MenuSearchField, ViewingNotice } from './menu-hero';
import { ItemCard } from './item-card';
import { MenuOrderFooter } from './menu-order-footer';
import { LanguageSwitcher } from './language-switcher';

/**
 * Category detail page mirroring the Flutter CategoryDetailPage:
 * back row → in-category search → single section (header + item grid).
 */
export function CategoryDetail({
  tenant,
  locale,
  categorySlug,
}: {
  tenant: TenantData;
  locale: string;
  categorySlug: string;
}) {
  const tm = useTranslations('menu');
  const [query, setQuery] = useState('');
  const cart = useOrderCart(tenant.slug, tenant.categories, locale);
  const isRtl = locale === 'ar';
  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  const category = useMemo(
    () => tenant.categories.find((c) => c.slug === categorySlug),
    [tenant.categories, categorySlug],
  );

  const ranked = useMemo(() => {
    if (!category) return [];
    const q = query.trim();
    return category.items
      .filter((i) => i.isAvailable)
      .map((item) => {
        const itemTrans = resolveTranslation(item, locale);
        return {
          item,
          itemTrans,
          rank: q
            ? searchRank(
                q,
                [item.name, itemTrans.name],
                [item.description, itemTrans.description],
              )
            : 1,
        };
      })
      .filter((r): r is typeof r & { rank: number } => r.rank !== null)
      .sort((a, b) => a.rank - b.rank || a.item.displayOrder - b.item.displayOrder);
  }, [query, category, locale]);

  const catTrans = category ? resolveTranslation(category, locale) : null;

  return (
    <>
      <MenuTheme tenant={tenant} />

      <main className="menu-page min-h-dvh" dir={isRtl ? 'rtl' : 'ltr'}>
        <div className="mx-auto px-4 pt-4" style={{ maxWidth: '900px' }}>
          <div className="flex items-center justify-between">
            <Link
              href={`/${tenant.slug}/menu`}
              className="inline-flex items-center gap-1 text-sm"
              style={{ color: 'var(--text-muted)' }}
            >
              <BackIcon size={18} strokeWidth={1.9} />
              {tm('title')}
            </Link>
            <LanguageSwitcher locale={locale} />
          </div>
        </div>

        <ViewingNotice text={tm('orderNotice')} isRtl={isRtl} />

        <MenuSearchField
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={tm('searchThisCategory')}
          clearLabel={tm('clear')}
          isRtl={isRtl}
        />

        <div className="mx-auto px-4 py-6 sm:py-8" style={{ maxWidth: '900px' }}>
          {!category || !catTrans ? (
            <p className="text-center text-sm py-8" style={{ color: 'var(--text-muted)' }}>
              {tm('noItems')}
            </p>
          ) : (
            <section className="menu-category">
              <div className="mb-4 pb-2" style={{ borderBottom: '0.5px solid #E4DDCF' }}>
                <h2 className="menu-section-header">{catTrans.name}</h2>
              </div>

              {ranked.length === 0 ? (
                <p
                  className="text-center text-sm py-8"
                  style={{ color: 'var(--text-muted)' }}
                >
                  {query.trim()
                    ? tm('noResults', { query: query.trim() })
                    : tm('noItems')}
                </p>
              ) : (
                <div
                  className="menu-items-grid grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                  style={{ gap: '14px' }}
                >
                  {ranked.map(({ item }) => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      categorySlug={category.slug}
                      locale={locale}
                      addLabel={tm('add')}
                      featuredLabel={tm('featured')}
                      cart={cart}
                    />
                  ))}
                </div>
              )}
            </section>
          )}

          {tenant.instagram && (
            <footer className="text-center mt-12 pb-8">
              <a
                href={`https://instagram.com/${tenant.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs inline-flex items-center gap-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {tenant.instagram}
              </a>
            </footer>
          )}
        </div>

        <MenuOrderFooter cart={cart} tenant={tenant} locale={locale} tm={tm} />
      </main>
    </>
  );
}
