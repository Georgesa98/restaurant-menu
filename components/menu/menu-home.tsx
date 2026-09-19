'use client';

import { useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { TenantData } from '@/lib/types';
import { searchRank, isLiveFeatured } from '@/lib/search';
import { resolveTranslation } from './menu-helpers';
import { useOrderCart } from './use-order-cart';
import { MenuTheme } from './menu-theme';
import { MenuHero } from './menu-hero';
import { CategoryCard } from './category-card';
import { CategoryGrid } from './category-grid';
import { ItemCard } from './item-card';
import { MenuOrderFooter } from './menu-order-footer';

/**
 * Category landing page mirroring the Flutter MenuPage: hero → global dish
 * search → featured shelf → "Browse categories" grid of image cards.
 * While searching, a flat ranked item grid replaces the grid (like the
 * Flutter SearchResultsSliver).
 */
export function MenuHome({ tenant, locale }: { tenant: TenantData; locale: string }) {
  const tm = useTranslations('menu');
  const [query, setQuery] = useState('');
  const cart = useOrderCart(tenant.slug, tenant.categories, locale);
  const isRtl = locale === 'ar';

  const categories = useMemo(
    () =>
      tenant.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [tenant.categories],
  );

  const featuredItems = useMemo(() => {
    const out: { item: (typeof categories)[number]['items'][number]; categorySlug: string }[] = [];
    for (const c of categories) {
      for (const item of c.items) {
        if (!item.isAvailable || !isLiveFeatured(item)) continue;
        out.push({ item, categorySlug: c.slug });
      }
    }
    return out.sort((a, b) => a.item.displayOrder - b.item.displayOrder);
  }, [categories]);

  const searchResults = useMemo(() => {
    const q = query.trim();
    if (!q) return null;
    const out: {
      item: (typeof categories)[number]['items'][number];
      categorySlug: string;
      rank: number;
    }[] = [];
    for (const c of categories) {
      for (const item of c.items) {
        if (!item.isAvailable) continue;
        const itemTrans = resolveTranslation(item, locale);
        const rank = searchRank(
          q,
          [item.name, itemTrans.name],
          [item.description, itemTrans.description],
        );
        if (rank !== null) out.push({ item, categorySlug: c.slug, rank });
      }
    }
    return out.sort(
      (a, b) => a.rank - b.rank || a.item.displayOrder - b.item.displayOrder,
    );
  }, [query, categories, locale]);

  const searching = searchResults !== null;

  return (
    <>
      <MenuTheme tenant={tenant} />

      <main className="menu-page min-h-dvh" dir={isRtl ? 'rtl' : 'ltr'}>
        <MenuHero
          tenant={tenant}
          locale={locale}
          isRtl={isRtl}
          query={query}
          onQueryChange={setQuery}
          searchPlaceholder={tm('searchDishes')}
          clearLabel={tm('clear')}
          notice={tm('orderNotice')}
        />

        <div className="mx-auto px-4 py-6 sm:py-8" style={{ maxWidth: '900px' }}>
          {searching ? (
            searchResults.length === 0 ? (
              <p
                className="text-center text-sm py-8"
                style={{ color: 'var(--text-muted)' }}
              >
                {tm('noResults', { query: query.trim() })}
              </p>
            ) : (
              <div
                className="menu-items-grid grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                style={{ gap: '14px' }}
              >
                {searchResults.map(({ item, categorySlug }) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    categorySlug={categorySlug}
                    locale={locale}
                    addLabel={tm('add')}
                    featuredLabel={tm('featured')}
                    cart={cart}
                  />
                ))}
              </div>
            )
          ) : (
            <div className="menu-categories-container space-y-12">
              {featuredItems.length > 0 && (
                <section className="menu-category">
                  <div className="mb-4 pb-2" style={{ borderBottom: '0.5px solid #E4DDCF' }}>
                    <h2 className="menu-section-header">⭐ {tm('featuredTitle')}</h2>
                  </div>
                  <div
                    className="menu-items-grid grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    style={{ gap: '14px' }}
                  >
                    {featuredItems.map(({ item, categorySlug }) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        categorySlug={categorySlug}
                        locale={locale}
                        addLabel={tm('add')}
                        featuredLabel={tm('featured')}
                        cart={cart}
                      />
                    ))}
                  </div>
                </section>
              )}

              <section>
                <div
                  className="mb-4 pb-2"
                  style={{ borderBottom: '0.5px solid #E4DDCF' }}
                >
                  <h2 className="menu-section-header">{tm('browseCategories')}</h2>
                </div>

                {categories.length === 0 ? (
                  <p
                    className="text-center text-sm py-8"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {tm('noCategories')}
                  </p>
                ) : (
                  <CategoryGrid>
                    {categories.map((category) => (
                      <CategoryCard
                        key={category.id}
                        tenantSlug={tenant.slug}
                        category={category}
                        locale={locale}
                        isRtl={isRtl}
                        countLabel={tm('dishesCount', {
                          count: category.items.filter((i) => i.isAvailable).length,
                        })}
                      />
                    ))}
                  </CategoryGrid>
                )}
              </section>
            </div>
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
