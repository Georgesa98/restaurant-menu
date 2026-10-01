'use client';

import Image from 'next/image';
import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { isLiveFeatured } from '@/lib/search';
import { qtyKeyFor, useCartQuantities, useCartSelectedVariants, useCartStore } from '@/lib/stores/cart-store';
import { CategorySlugIcon, formatPrice, resolveTranslation, type MenuItem } from './menu-helpers';

type Ripple = { id: number; x: number; y: number };

/** Single dish card: photo (or slug icon wash), name + price, variants, stepper. */
export function ItemCard({
  item,
  categorySlug,
  locale,
  addLabel,
  featuredLabel,
}: {
  item: MenuItem;
  categorySlug: string;
  locale: string;
  addLabel: string;
  featuredLabel: string;
}) {
  const quantities = useCartQuantities();
  const selectedVariants = useCartSelectedVariants();
  const { setQuantity, selectVariant } = useCartStore();
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const isRtl = locale === 'ar';

  const itemTrans = resolveTranslation(item, locale);
  const live = isLiveFeatured(item);
  const hasVariants = item.variants.length > 0;
  const selectedVariant = hasVariants
    ? (item.variants.find((v) => v.id === selectedVariants[item.id]) ?? item.variants[0])
    : null;

  const qtyKey = qtyKeyFor(item, selectedVariants);
  const qty = quantities[qtyKey] ?? 0;

  const displayPrice = selectedVariant ? Number(selectedVariant.price) : item.basePrice ? Number(item.basePrice) : 0;

  const fromPrice = hasVariants ? Math.min(...item.variants.map((v) => Number(v.price))) : displayPrice;

  function handleIncrement(event: React.MouseEvent<HTMLButtonElement>, key: string) {
    setQuantity(key, 1);
    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    const id = Date.now() + Math.random();
    setRipples((prev) => [...prev, { id, x: event.clientX - rect.left, y: event.clientY - rect.top }]);
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id));
    }, 500);
  }

  return (
    <article className="menu-card">
      <div className="menu-card-image-wrap" style={{ background: '#EDE7DB' }}>
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={itemTrans.name}
            width={400}
            height={300}
            sizes="(max-width:640px)100vw,(max-width:1024px)50vw,33vw"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full">
            <CategorySlugIcon slug={categorySlug} className="placeholder-icon" />
          </div>
        )}
      </div>

      <div className="menu-card-body">
        <div className="flex items-start justify-between gap-2">
          <h3 className="menu-item-name truncate" title={live ? featuredLabel : undefined}>
            {live ? `★ ${itemTrans.name}` : itemTrans.name}
          </h3>
          <span className="menu-item-price whitespace-nowrap shrink-0">
            {hasVariants ? `from ${formatPrice(fromPrice, locale)}` : formatPrice(displayPrice, locale)}
          </span>
        </div>

        {itemTrans.description && <p className="menu-item-description mt-1">{itemTrans.description}</p>}

        {hasVariants && (
          <div className="variant-chips mt-2">
            {item.variants.map((v) => {
              const isSelected = (selectedVariants[item.id] ?? item.variants[0].id) === v.id;
              const vKey = `${item.id}:${v.id}`;
              const hasQty = (quantities[vKey] ?? 0) > 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`variant-chip ${isSelected ? 'selected' : ''} ${hasQty ? 'has-qty' : ''}`}
                  onClick={() => selectVariant(item.id, v.id)}
                >
                  {isRtl ? v.label : v.labelEn} · {formatPrice(Number(v.price), locale)}
                </button>
              );
            })}
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
                onClick={(e) => handleIncrement(e, qtyKey)}
                className="stepper-btn"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={2} />
                {ripples.map((r) => (
                  <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
                ))}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => handleIncrement(e, qtyKey)}
              className="stepper-btn add"
              aria-label="Add item"
            >
              <Plus size={14} strokeWidth={2} />
              <span>{addLabel}</span>
              {ripples.map((r) => (
                <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
              ))}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
