'use client';

import Image from 'next/image';
import { Minus, Plus } from 'lucide-react';
import { isLiveFeatured } from '@/lib/search';
import {
  CategorySlugIcon,
  formatPrice,
  resolveTranslation,
  type MenuItem,
} from './menu-helpers';
import { qtyKeyFor, type OrderCart } from './use-order-cart';

/** Single dish card: photo (or slug icon wash), name + price, variants, stepper. */
export function ItemCard({
  item,
  categorySlug,
  locale,
  addLabel,
  featuredLabel,
  cart,
}: {
  item: MenuItem;
  categorySlug: string;
  locale: string;
  addLabel: string;
  featuredLabel: string;
  cart: OrderCart;
}) {
  const itemTrans = resolveTranslation(item, locale);
  const live = isLiveFeatured(item);
  const hasVariants = item.variants.length > 0;
  const selectedVariant = hasVariants
    ? (item.variants.find((v) => v.id === cart.selectedVariants.get(item.id)) ??
      item.variants[0])
    : null;

  const qtyKey = qtyKeyFor(item, cart.selectedVariants);
  const qty = cart.quantities.get(qtyKey) ?? 0;

  const displayPrice = selectedVariant
    ? Number(selectedVariant.price)
    : item.basePrice
      ? Number(item.basePrice)
      : 0;

  const fromPrice = hasVariants
    ? Math.min(...item.variants.map((v) => Number(v.price)))
    : displayPrice;

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
            {hasVariants
              ? `from ${formatPrice(fromPrice, locale)}`
              : formatPrice(displayPrice, locale)}
          </span>
        </div>

        {itemTrans.description && (
          <p className="menu-item-description mt-1">{itemTrans.description}</p>
        )}

        {hasVariants && (
          <div className="variant-chips mt-2">
            {item.variants.map((v) => {
              const isSelected =
                (cart.selectedVariants.get(item.id) ?? item.variants[0].id) === v.id;
              const vKey = `${item.id}:${v.id}`;
              const hasQty = (cart.quantities.get(vKey) ?? 0) > 0;
              return (
                <button
                  key={v.id}
                  type="button"
                  className={`variant-chip ${isSelected ? 'selected' : ''} ${hasQty ? 'has-qty' : ''}`}
                  onClick={() => cart.selectVariant(item.id, v.id)}
                >
                  {(cart.isRtl ? v.label : v.labelEn)} · {formatPrice(Number(v.price), locale)}
                </button>
              );
            })}
          </div>
        )}

        <div
          className="mt-auto pt-3 flex"
          style={{ justifyContent: cart.isRtl ? 'flex-start' : 'flex-end' }}
        >
          {qty > 0 ? (
            <div className="stepper">
              <button
                type="button"
                onClick={() => cart.setQuantity(qtyKey, -1)}
                className="stepper-btn"
                aria-label="Decrease quantity"
              >
                <Minus size={14} strokeWidth={2} />
              </button>
              <span className="stepper-count">{qty}</span>
              <button
                type="button"
                onClick={(e) => cart.handleIncrement(e, qtyKey, item.id)}
                className="stepper-btn"
                aria-label="Increase quantity"
              >
                <Plus size={14} strokeWidth={2} />
                {cart.ripples
                  .filter((r) => r.itemId === item.id)
                  .map((r) => (
                    <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
                  ))}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={(e) => cart.handleIncrement(e, qtyKey, item.id)}
              className="stepper-btn add"
              aria-label="Add item"
            >
              <Plus size={14} strokeWidth={2} />
              <span>{addLabel}</span>
              {cart.ripples
                .filter((r) => r.itemId === item.id)
                .map((r) => (
                  <span key={r.id} className="ripple" style={{ left: r.x, top: r.y }} />
                ))}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
