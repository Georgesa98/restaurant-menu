'use client';

import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { isLiveFeatured } from '@/lib/search';
import { qtyKeyFor, useCartQuantities, useCartSelectedVariants, useCartStore } from '@/lib/stores/cart-store';
import { formatPriceNumber, resolveTranslation, type MenuItem } from './menu-helpers';

type Ripple = { id: number; x: number; y: number };

/** Text variant of a dish row: leader-line name/price row, description, variants, stepper. No photos. */
export function ItemLine({
  item,
  locale,
  addLabel,
  featuredLabel,
}: {
  item: MenuItem;
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
    <article className="item-line">
      <div className="item-line-row">
        <h3 className="menu-item-name" title={live ? featuredLabel : undefined}>
          {live ? `★ ${itemTrans.name}` : itemTrans.name}
        </h3>
        <span className="item-line-leader" aria-hidden="true" />
        <span className="menu-item-price whitespace-nowrap shrink-0">
          {hasVariants ? `from ${formatPriceNumber(fromPrice, locale)}` : formatPriceNumber(displayPrice, locale)}
        </span>
        {qty > 0 ? (
          <div className="stepper stepper-filled">
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
            className="item-line-add"
            aria-label={addLabel}
          >
            <Plus size={16} strokeWidth={2} />
            {ripples.map((r) => (
              <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
            ))}
          </button>
        )}
      </div>

      {itemTrans.description && <p className="item-line-description">{itemTrans.description}</p>}

      {hasVariants && (
        <div className="variant-chips mt-1.5">
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
                {isRtl ? v.label : v.labelEn} · {formatPriceNumber(Number(v.price), locale)}
              </button>
            );
          })}
        </div>
      )}

    </article>
  );
}
