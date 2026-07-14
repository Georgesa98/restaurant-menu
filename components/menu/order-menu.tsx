'use client';

import { useState, useMemo, useRef } from 'react';
import type { TenantData, WithTranslations } from '@/lib/types';
import { LanguageSwitcher } from './language-switcher';
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
} from 'lucide-react';

function t(item: WithTranslations<{ name: string; description: string | null }>): {
  name: string;
  description: string | null;
} {
  const tr = item.translations?.[0];
  return {
    name: tr?.name ?? item.name,
    description: tr?.description ?? item.description,
  };
}

function spaceToPx(space: string): string {
  if (space === 'compact') return '12px';
  if (space === 'spacious') return '24px';
  return '16px';
}

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
}

function categoryIcon(slug: string) {
  switch (slug) {
    case 'hot-drinks':
      return Coffee;
    case 'cold-drinks':
      return CupSoda;
    case 'western':
      return Beef;
    case 'crepes':
      return Croissant;
    case 'oriental':
      return Flame;
    case 'alcoholic-drinks':
      return Wine;
    case 'pizza':
      return Pizza;
    case 'barista':
      return Coffee;
    case 'cold-appetizers':
      return Salad;
    case 'hot-appetizers':
      return Soup;
    case 'salads':
      return Salad;
    case 'pasta':
      return Soup;
    case 'hookah':
      return Wind;
    case 'desserts':
      return Cookie;
    default:
      return UtensilsCrossed;
  }
}

function retinaSrc(cardSrc: string | null): string | null {
  if (!cardSrc) return null;
  return cardSrc.replace('_card.webp', '_card@2x.webp');
}

export function OrderMenu({ tenant, locale }: { tenant: TenantData; locale: string }) {
  const [quantities, setQuantities] = useState<Map<string, number>>(new Map());
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});

  const space = spaceToPx(tenant.spacing);
  const gridCols = tenant.menuLayout === 'auto-fit' ? 'repeat(auto-fit, minmax(180px, 1fr))' : '1fr';
  const isRtl = locale === 'ar';

  const categories = useMemo(
    () =>
      tenant.categories
        .filter((c) => c.isActive)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [tenant.categories]
  );

  const totalItems = useMemo(() => {
    let count = 0;
    for (const q of quantities.values()) count += q;
    return count;
  }, [quantities]);

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [id, q] of quantities) {
      const item = tenant.categories.flatMap((c) => c.items).find((i) => i.id === id);
      if (item) total += Number(item.price) * q;
    }
    return total;
  }, [quantities, tenant.categories]);

  function setQuantity(id: string, delta: number) {
    setQuantities((prev) => {
      const next = new Map(prev);
      const current = next.get(id) ?? 0;
      const updated = current + delta;
      if (updated <= 0) next.delete(id);
      else next.set(id, updated);
      return next;
    });
  }

  function scrollToCategory(slug: string) {
    const el = sectionRefs.current[slug];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveCategory(slug);
    }
  }

  return (
    <>
      <style>{`
        :root {
          --primary: ${tenant.primaryColor};
          --secondary: ${tenant.secondaryColor};
          --accent: ${tenant.accentColor};
          --accent-text: #9C7638;
          --bg: ${tenant.backgroundColor};
          --surface: ${tenant.surfaceColor};
          --text: ${tenant.textColor};
          --text-muted: ${tenant.textMuted};
          --font-heading: ${tenant.headingFont};
          --font-body: ${tenant.bodyFont};
          --font-script: 'Alex Brush', cursive;
          --radius-sm: ${tenant.borderRadiusSm};
          --radius-md: ${tenant.borderRadiusMd};
          --radius-lg: ${tenant.borderRadiusLg};
          --shadow: ${tenant.shadow};
          --card-style: ${tenant.cardStyle};
          --menu-grid: ${gridCols};
          --space: ${space};
        }

        .menu-page {
          font-family: var(--font-body);
          background: var(--bg);
          color: var(--text);
        }

        .menu-card {
          background: var(--surface);
          border: 0.5px solid #E4DDCF;
          border-radius: var(--radius-lg);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .menu-category-nav {
          position: sticky;
          top: 0;
          z-index: 20;
          background: var(--bg);
          border-bottom: 0.5px solid #E4DDCF;
        }

        .menu-category-nav::-webkit-scrollbar {
          display: none;
        }

        .menu-category-pill {
          flex: 0 0 auto;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 10px 0;
          margin: 0 14px;
          color: var(--text-muted);
          border-bottom: 2px solid transparent;
          background: transparent;
          border-top: none;
          border-left: none;
          border-right: none;
          cursor: pointer;
          transition: color 120ms ease;
        }

        .menu-category-pill:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        .menu-category-pill.active {
          color: var(--primary);
          border-bottom-color: var(--accent);
        }

        .menu-section-header {
          font-family: var(--font-heading);
          font-size: 19px;
          font-weight: 500;
          font-style: italic;
          color: var(--primary);
          letter-spacing: -0.01em;
        }

        .menu-eyebrow {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--primary);
        }

        .menu-item-name {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--primary);
          line-height: 1.25;
        }

        .menu-item-description {
          font-family: var(--font-body);
          font-size: 12px;
          line-height: 1.45;
          color: var(--text-muted);
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .menu-item-price {
          font-family: var(--font-body);
          font-size: 14px;
          font-weight: 500;
          color: var(--accent-text);
        }

        .qty-btn {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          cursor: pointer;
          transition: background 120ms ease, color 120ms ease;
        }

        .qty-btn:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
        }

        .qty-btn-dec {
          background: transparent;
          border: 0.5px solid #C9C0B2;
          color: var(--primary);
        }

        .qty-btn-inc {
          background: var(--primary);
          border: 0.5px solid var(--primary);
          color: var(--bg);
        }

        .menu-counter {
          position: sticky;
          bottom: 0;
          z-index: 30;
          background: var(--primary);
          color: #fff;
        }

        .menu-counter-label {
          color: #B7BEC2;
          font-size: 13px;
        }

        .menu-counter-sub {
          color: #8C959A;
          font-size: 11px;
        }

        .menu-counter-total {
          font-family: var(--font-body);
          font-size: 20px;
          font-weight: 500;
          color: var(--accent);
        }

        .placeholder-icon {
          color: var(--accent);
        }

        ${tenant.customCss ?? ''}
      `}</style>

      <main className="menu-page min-h-dvh" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Category nav */}
        <nav className="menu-category-nav">
          <div
            className="mx-auto px-4 overflow-x-auto whitespace-nowrap"
            style={{ maxWidth: '900px' }}
          >
            <div className="flex py-2">
              {categories.map((category) => {
                const catTrans = t(category);
                const isActive = activeCategory === category.slug;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => scrollToCategory(category.slug)}
                    className={`menu-category-pill ${isActive ? 'active' : ''}`}
                  >
                    {catTrans.name}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="mx-auto px-4 py-8" style={{ maxWidth: '900px' }}>
          {/* Language Switcher */}
          <div className={`mb-6 ${isRtl ? 'text-left' : 'text-right'}`}>
            <LanguageSwitcher locale={locale} slug={tenant.slug} />
          </div>

          {/* Hero header */}
          <header className="text-center mb-10">
            {tenant.logoUrl ? (
              <img
                src={tenant.logoUrl}
                alt={tenant.name}
                className="h-16 mx-auto mb-4 object-contain"
              />
            ) : (
              <>
                <span className="menu-eyebrow block mb-2">Restaurant</span>
                <h1
                  className="text-5xl leading-none mb-3"
                  style={{
                    fontFamily: isRtl ? 'var(--font-heading)' : 'var(--font-script)',
                    color: 'var(--primary)',
                  }}
                >
                  {tenant.name}
                </h1>
              </>
            )}
            {tenant.description && (
              <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
                {tenant.description}
              </p>
            )}
            {(tenant.address || tenant.phone) && (
              <div
                className="mt-3 text-xs space-y-1"
                style={{ color: 'var(--text-muted)' }}
              >
                {tenant.address && <p>{tenant.address}</p>}
                {tenant.phone && <p>{tenant.phone}</p>}
              </div>
            )}
          </header>

          {/* Categories */}
          <div className="space-y-12">
            {categories.map((category) => {
              const catTrans = t(category);
              const items = category.items
                .filter((i) => i.isAvailable)
                .sort((a, b) => a.displayOrder - b.displayOrder);
              const Icon = categoryIcon(category.slug);

              return (
                <section
                  key={category.id}
                  id={`cat-${category.slug}`}
                  ref={(el) => {
                    sectionRefs.current[category.slug] = el;
                  }}
                  className="menu-category"
                >
                  <div className="mb-4 pb-2" style={{ borderBottom: '0.5px solid #E4DDCF' }}>
                    <h2 className="menu-section-header">{catTrans.name}</h2>
                  </div>

                  <div
                    className="menu-items-grid"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: gridCols,
                      gap: '14px',
                    }}
                  >
                    {items.map((item) => {
                      const itemTrans = t(item);
                      const qty = quantities.get(item.id) ?? 0;
                      const cardSrc = item.imageCard;
                      const retinaSrcUrl = retinaSrc(cardSrc);

                      return (
                        <article key={item.id} className="menu-card">
                          {cardSrc ? (
                            <div
                              className="overflow-hidden"
                              style={{
                                aspectRatio: '4 / 3',
                                borderRadius: `${tenant.borderRadiusLg} ${tenant.borderRadiusLg} 0 0`,
                              }}
                            >
                              <img
                                src={cardSrc}
                                alt={itemTrans.name}
                                loading="lazy"
                                width={400}
                                height={300}
                                srcSet={retinaSrcUrl ? `${cardSrc} 1x, ${retinaSrcUrl} 2x` : undefined}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ) : (
                            <div
                              className="flex items-center justify-center"
                              style={{
                                aspectRatio: '4 / 3',
                                background: '#EDE7DB',
                                borderRadius: `${tenant.borderRadiusLg} ${tenant.borderRadiusLg} 0 0`,
                              }}
                            >
                              <Icon className="placeholder-icon" size={40} strokeWidth={1.2} />
                            </div>
                          )}

                          <div className="flex flex-col p-3" style={{ padding: '12px 14px 14px' }}>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="menu-item-name truncate">{itemTrans.name}</h3>
                              <span className="menu-item-price whitespace-nowrap shrink-0">
                                {formatPrice(Number(item.price), locale)}
                              </span>
                            </div>

                            {itemTrans.description && (
                              <p className="menu-item-description mt-1">{itemTrans.description}</p>
                            )}

                            {item.dietaryTags.length > 0 && (
                              <div className="flex flex-wrap gap-1.5 mt-2">
                                {item.dietaryTags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full"
                                    style={{
                                      background: 'var(--secondary)',
                                      color: 'var(--bg)',
                                    }}
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex items-center gap-2 mt-auto pt-3">
                              {qty > 0 && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(item.id, -1)}
                                    className="qty-btn qty-btn-dec"
                                    aria-label="Decrease quantity"
                                  >
                                    −
                                  </button>
                                  <span
                                    className="text-xs font-medium w-4 text-center tabular-nums"
                                    style={{ color: 'var(--primary)' }}
                                  >
                                    {qty}
                                  </span>
                                </>
                              )}
                              <button
                                type="button"
                                onClick={() => setQuantity(item.id, 1)}
                                className="qty-btn qty-btn-inc"
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>

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

        {/* Sticky bottom counter */}
        {totalItems > 0 && (
          <div className="menu-counter">
            <div
              className="mx-auto px-4 py-3 flex items-center justify-between"
              style={{ maxWidth: '900px' }}
            >
              <div>
                <div className="menu-counter-label">
                  {totalItems} item{totalItems !== 1 ? 's' : ''}
                </div>
                <div className="menu-counter-sub">Tap + to add more</div>
              </div>
              <div className="menu-counter-total">{formatPrice(totalPrice, locale)}</div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
