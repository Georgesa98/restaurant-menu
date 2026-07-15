'use client';

import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import type { TenantData, WithTranslations } from '@/lib/types';
import { LanguageSwitcher } from './language-switcher';
import { OrderSheet } from './order-sheet';
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
  Minus,
  Plus,
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

function formatPrice(price: number, locale: string): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US', {
    style: 'currency',
    currency: 'SYP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
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

type Ripple = { id: number; itemId: string; x: number; y: number };

function getStorageKey(slug: string) {
  return `menu-order:${slug}`;
}

function loadQuantities(slug: string): Map<string, number> {
  if (typeof window === 'undefined') return new Map();
  try {
    const raw = localStorage.getItem(getStorageKey(slug));
    if (!raw) return new Map();
    const parsed = JSON.parse(raw) as Record<string, number>;
    const map = new Map<string, number>();
    for (const [key, qty] of Object.entries(parsed)) {
      if (typeof qty === 'number' && qty > 0) map.set(key, qty);
    }
    return map;
  } catch {
    return new Map();
  }
}

function saveQuantities(slug: string, quantities: Map<string, number>) {
  if (typeof window === 'undefined') return;
  try {
    const record: Record<string, number> = {};
    for (const [key, qty] of quantities) {
      if (qty > 0) record[key] = qty;
    }
    localStorage.setItem(getStorageKey(slug), JSON.stringify(record));
  } catch {
    // ignore storage errors (private mode, etc.)
  }
}

function getPrice(item: WithTranslations<{
  id: string;
  name: string;
  description: string | null;
  basePrice: { toString: () => string } | null;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  dietaryTags: string[];
  variants: { id: string; label: string; price: { toString: () => string }; sortOrder: number }[];
}>): number {
  if (item.variants.length > 0) {
    return Math.min(...item.variants.map((v) => Number(v.price)));
  }
  return item.basePrice ? Number(item.basePrice) : 0;
}

export type OrderedEntry = {
  key: string;
  itemId: string;
  variantId?: string;
  label: string;
  price: number;
  categoryName: string;
};

export function OrderMenu({ tenant, locale }: { tenant: TenantData; locale: string }) {
  const tm = useTranslations('menu');

  const [quantities, setQuantities] = useState<Map<string, number>>(() =>
    loadQuantities(tenant.slug)
  );

  const [selectedVariants, setSelectedVariants] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const cat of tenant.categories) {
      for (const item of cat.items) {
        if (item.variants.length > 0 && item.isAvailable) {
          map.set(item.id, item.variants[0].id);
        }
      }
    }
    return map;
  });
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const isRtl = locale === 'ar';

  useEffect(() => {
    saveQuantities(tenant.slug, quantities);
  }, [tenant.slug, quantities]);

  const clearOrder = useCallback(() => {
    setQuantities(new Map());
    setIsSheetOpen(false);
  }, []);

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
    for (const [key, q] of quantities) {
      const [itemId, variantId] = key.split(':');
      for (const cat of tenant.categories) {
        const item = cat.items.find((i) => i.id === itemId);
        if (item) {
          if (variantId) {
            const v = item.variants.find((v) => v.id === variantId);
            if (v) total += Number(v.price) * q;
          } else {
            total += (item.basePrice ? Number(item.basePrice) : 0) * q;
          }
          break;
        }
      }
    }
    return total;
  }, [quantities, tenant.categories]);

  const visibleCategories = useMemo(
    () => (selectedCategory === 'all' ? categories : categories.filter((c) => c.slug === selectedCategory)),
    [categories, selectedCategory]
  );

  const setQuantity = useCallback((key: string, delta: number) => {
    setQuantities((prev) => {
      const next = new Map(prev);
      const current = next.get(key) ?? 0;
      const updated = current + delta;
      if (updated <= 0) next.delete(key);
      else next.set(key, updated);
      return next;
    });
  }, []);

  function addRipple(event: React.MouseEvent<HTMLButtonElement>, itemId: string) {
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, itemId, x, y }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 500);
  }

  function handleIncrement(event: React.MouseEvent<HTMLButtonElement>, key: string, itemId: string) {
    setQuantity(key, 1);
    addRipple(event, itemId);
  }

  function selectCategory(slug: string | 'all') {
    setSelectedCategory(slug);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const orderedEntries = useMemo(() => {
    const result: OrderedEntry[] = [];
    for (const [key, q] of quantities) {
      if (q <= 0) continue;
      const [itemId, variantId] = key.split(':');
      for (const cat of categories) {
        const item = cat.items.find((i) => i.id === itemId);
        if (item) {
          const catTrans = t(cat);
          const itemTrans = t(item);
          let price = 0;
          let label = itemTrans.name;
          if (variantId) {
            const v = item.variants.find((v) => v.id === variantId);
            if (v) {
              price = Number(v.price);
              const vLabel = isRtl ? v.label : v.labelEn;
              label = `${itemTrans.name} — ${vLabel}`;
            }
          } else {
            price = item.basePrice ? Number(item.basePrice) : 0;
          }
          result.push({ key, itemId, variantId, label, price, categoryName: catTrans.name });
          break;
        }
      }
    }
    return result;
  }, [quantities, categories]);

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

        .menu-category {
          content-visibility: auto;
          contain-intrinsic-size: 400px;
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

        .nav-scroll-hint {
          position: relative;
        }

        .nav-scroll-hint::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          width: 40px;
          background: linear-gradient(to left, var(--bg), transparent);
          pointer-events: none;
        }

        [dir='rtl'] .nav-scroll-hint::after {
          right: auto;
          left: 0;
          background: linear-gradient(to right, var(--bg), transparent);
        }

        .menu-category-pill {
          flex: 0 0 auto;
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 12px 0;
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
          font-size: 20px;
          font-weight: 500;
          font-style: italic;
          color: var(--primary);
          letter-spacing: -0.01em;
        }

        .menu-eyebrow {
          font-family: var(--font-body);
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: var(--primary);
        }

        .menu-item-name {
          font-family: var(--font-body);
          font-size: 15px;
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

        .stepper {
          display: inline-flex;
          align-items: center;
          border: 0.5px solid #C9C0B2;
          border-radius: 999px;
          background: var(--surface);
          overflow: hidden;
          height: 36px;
        }

        .stepper-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: none;
          background: transparent;
          color: var(--primary);
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: background 120ms ease;
        }

        .stepper-btn:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 2px;
          z-index: 1;
        }

        .stepper-btn.add {
          background: var(--primary);
          color: var(--bg);
          width: 56px;
          gap: 4px;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.05em;
          text-transform: uppercase;
        }

        .stepper-count {
          min-width: 2ch;
          text-align: center;
          font-size: 13px;
          font-weight: 500;
          color: var(--primary);
          padding: 0 4px;
        }

        .ripple {
          position: absolute;
          width: 8px;
          height: 8px;
          background: var(--accent);
          border-radius: 50%;
          transform: translate(-50%, -50%) scale(1);
          animation: ripple-grow 500ms ease-out forwards;
          pointer-events: none;
          opacity: 0.6;
        }

        @keyframes ripple-grow {
          to {
            transform: translate(-50%, -50%) scale(12);
            opacity: 0;
          }
        }

        .menu-counter {
          position: sticky;
          bottom: 0;
          z-index: 30;
          background: var(--primary);
          color: #fff;
          cursor: pointer;
          border: none;
        }

        .menu-counter-label {
          color: #B7BEC2;
          font-size: 14px;
          font-weight: 500;
        }

        .menu-counter-sub {
          color: #8C959A;
          font-size: 11px;
        }

        .menu-counter-total {
          font-family: var(--font-body);
          font-size: 22px;
          font-weight: 500;
          color: var(--accent);
        }

        .placeholder-icon {
          color: var(--accent);
        }

        .variant-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .variant-chip {
          font-family: var(--font-body);
          font-size: 11px;
          font-weight: 500;
          padding: 4px 10px;
          border-radius: 999px;
          border: 0.5px solid #C9C0B2;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 120ms ease;
        }

        .variant-chip:focus-visible {
          outline: 2px solid var(--primary);
          outline-offset: 1px;
        }

        .variant-chip.selected {
          background: var(--accent);
          border-color: var(--accent);
          color: #fff;
        }

        .variant-chip.has-qty {
          border-color: var(--accent);
          color: var(--accent);
        }

        .variant-chip.selected.has-qty {
          background: var(--accent);
          color: #fff;
        }

        @media (min-width: 480px) {
          .menu-item-name {
            font-size: 14px;
          }

          .stepper {
            height: 28px;
          }

          .stepper-btn {
            width: 28px;
            height: 28px;
          }

          .stepper-btn.add {
            width: 52px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .ripple {
            animation: none;
            opacity: 0;
          }
        }

        ${tenant.customCss ?? ''}
      `}</style>

      <main className="menu-page min-h-dvh" dir={isRtl ? 'rtl' : 'ltr'}>
        {/* Hero header */}
        <header className="relative text-center px-4 pt-8 pb-6" style={{ background: 'var(--bg)' }}>
          <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'}`}>
            <LanguageSwitcher locale={locale} slug={tenant.slug} />
          </div>

          {tenant.logoUrl ? (
            <img
              src={tenant.logoUrl}
              alt="Valley Star"
              className="h-16 mx-auto mb-4 object-contain"
            />
          ) : (
            <>
              <span className="menu-eyebrow block mb-2">Restaurant</span>
              <h1
                className="text-[48px] sm:text-5xl leading-none mb-3"
                style={{
                  fontFamily: 'var(--font-script)',
                  color: 'var(--primary)',
                }}
              >
                Valley Star
              </h1>
            </>
          )}

          {tenant.description && (
            <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
              {tenant.description}
            </p>
          )}

          {(tenant.address || tenant.phone) && (
            <div className="mt-3 text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
              {tenant.address && <p>{tenant.address}</p>}
              {tenant.phone && <p>{tenant.phone}</p>}
            </div>
          )}
        </header>

        {/* Category nav */}
        <nav className="menu-category-nav nav-scroll-hint">
          <div className="mx-auto px-4 overflow-x-auto whitespace-nowrap" style={{ maxWidth: '900px' }}>
            <div className="flex py-1">
              <button
                type="button"
                onClick={() => selectCategory('all')}
                className={`menu-category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                {tm('all')}
              </button>
              {categories.map((category) => {
                const catTrans = t(category);
                const isActive = selectedCategory === category.slug;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => selectCategory(category.slug)}
                    className={`menu-category-pill ${isActive ? 'active' : ''}`}
                  >
                    {catTrans.name}
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        {/* Categories */}
        <div
          className="mx-auto px-4 py-6 sm:py-8"
          style={{ maxWidth: '900px' }}
        >
          <div className="space-y-12">
            {visibleCategories.map((category) => {
              const catTrans = t(category);
              const items = category.items
                .filter((i) => i.isAvailable)
                .sort((a, b) => a.displayOrder - b.displayOrder);
              const Icon = categoryIcon(category.slug);

              return (
                <section
                  key={category.id}
                  id={`cat-${category.slug}`}
                  className="menu-category"
                >
                  <div className="mb-4 pb-2" style={{ borderBottom: '0.5px solid #E4DDCF' }}>
                    <h2 className="menu-section-header">{catTrans.name}</h2>
                  </div>

                  <div
                    className="menu-items-grid grid grid-cols-1 min-[480px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                    style={{ gap: '14px' }}
                  >
                    {items.map((item) => {
                      const itemTrans = t(item);
                      const hasVariants = item.variants.length > 0;
                      const selectedVariantId = selectedVariants.get(item.id);
                      const selectedVariant = hasVariants
                        ? item.variants.find((v) => v.id === selectedVariantId) ?? item.variants[0]
                        : null;

                      const qtyKey = hasVariants && selectedVariant
                        ? `${item.id}:${selectedVariant.id}`
                        : item.id;
                      const qty = quantities.get(qtyKey) ?? 0;

                      const displayPrice = selectedVariant
                        ? Number(selectedVariant.price)
                        : (item.basePrice ? Number(item.basePrice) : 0);

                      const fromPrice = hasVariants
                        ? Math.min(...item.variants.map((v) => Number(v.price)))
                        : displayPrice;

                      return (
                        <article key={item.id} className="menu-card">
                          {item.imageUrl ? (
                            <div
                              className="overflow-hidden"
                              style={{
                                aspectRatio: '4 / 3',
                                borderRadius: `${tenant.borderRadiusLg} ${tenant.borderRadiusLg} 0 0`,
                              }}
                            >
                              <img
                                src={item.imageUrl}
                                alt={itemTrans.name}
                                loading="lazy"
                                width={400}
                                height={300}
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
                              <Icon className="placeholder-icon" size={36} strokeWidth={1.2} />
                            </div>
                          )}

                          <div className="flex flex-col" style={{ padding: '12px 14px 14px' }}>
                            <div className="flex items-start justify-between gap-2">
                              <h3 className="menu-item-name truncate">{itemTrans.name}</h3>
                              <span className="menu-item-price whitespace-nowrap shrink-0">
                                {hasVariants
                                  ? `from ${formatPrice(fromPrice, locale)}`
                                  : formatPrice(displayPrice, locale)}
                              </span>
                            </div>

                            {itemTrans.description && (
                              <p className="menu-item-description mt-1">{itemTrans.description}</p>
                            )}

                            {/* Variant chips */}
                            {hasVariants && (
                              <div className="variant-chips mt-2">
                                {item.variants.map((v) => {
                                  const isSelected = (selectedVariants.get(item.id) ?? item.variants[0].id) === v.id;
                                  const vKey = `${item.id}:${v.id}`;
                                  const hasQty = (quantities.get(vKey) ?? 0) > 0;
                                  return (
                                    <button
                                      key={v.id}
                                      type="button"
                                      className={`variant-chip ${isSelected ? 'selected' : ''} ${hasQty ? 'has-qty' : ''}`}
                                      onClick={() => {
                                        setSelectedVariants((prev) => {
                                          const next = new Map(prev);
                                          next.set(item.id, v.id);
                                          return next;
                                        });
                                      }}
                                    >
                                      {(isRtl ? v.label : v.labelEn)} · {formatPrice(Number(v.price), locale)}
                                    </button>
                                  );
                                })}
                              </div>
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

                            <div className="mt-auto pt-3 flex" style={{ justifyContent: isRtl ? 'flex-start' : 'flex-end' }}>
                              {qty > 0 ? (
                                <div className="stepper">
                                  <button
                                    type="button"
                                    onClick={() => setQuantity(qtyKey, -1)}
                                    className="stepper-btn"
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus size={14} strokeWidth={2} />
                                  </button>
                                  <span className="stepper-count">{qty}</span>
                                  <button
                                    type="button"
                                    onClick={(e) => handleIncrement(e, qtyKey, item.id)}
                                    className="stepper-btn"
                                    aria-label="Increase quantity"
                                  >
                                    <Plus size={14} strokeWidth={2} />
                                    {ripples
                                      .filter((r) => r.itemId === item.id)
                                      .map((r) => (
                                        <span
                                          key={r.id}
                                          className="ripple"
                                          style={{ left: r.x, top: r.y }}
                                        />
                                      ))}
                                  </button>
                                </div>
                              ) : (
                                <button
                                  type="button"
                                  onClick={(e) => handleIncrement(e, qtyKey, item.id)}
                                  className="stepper-btn add"
                                  aria-label="Add item"
                                >
                                  <Plus size={14} strokeWidth={2} />
                                  <span>{tm('add')}</span>
                                  {ripples
                                    .filter((r) => r.itemId === item.id)
                                    .map((r) => (
                                      <span
                                        key={r.id}
                                        className="ripple"
                                        style={{ left: r.x, top: r.y }}
                                      />
                                    ))}
                                </button>
                              )}
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
          <button
            type="button"
            onClick={() => setIsSheetOpen(true)}
            className="menu-counter w-full text-left"
            aria-label={tm('yourOrder')}
          >
            <div
              className="mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between"
              style={{ maxWidth: '900px' }}
            >
              <div>
                <div className="menu-counter-label">
                  {tm('itemCount', { count: totalItems })}
                </div>
                <div className="menu-counter-sub">{tm('tapToAdd')}</div>
              </div>
              <div className="menu-counter-total">{formatPrice(totalPrice, locale)}</div>
            </div>
          </button>
        )}

        <OrderSheet
          isOpen={isSheetOpen}
          onClose={() => setIsSheetOpen(false)}
          onClearOrder={clearOrder}
          entries={orderedEntries}
          quantities={quantities}
          onUpdateQuantity={setQuantity}
          locale={locale}
          t={tm}
          tenant={tenant}
        />
      </main>
    </>
  );
}
