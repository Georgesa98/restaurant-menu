'use client';

import { useTranslations } from 'next-intl';
import type { TenantData } from '@/lib/types';
import { formatPrice } from './menu-helpers';
import type { OrderCart } from './use-order-cart';
import { OrderSheet } from './order-sheet';

/** Sticky bottom order counter + order sheet, shared by home and detail. */
export function MenuOrderFooter({
  cart,
  tenant,
  locale,
  tm,
}: {
  cart: OrderCart;
  tenant: TenantData;
  locale: string;
  tm: ReturnType<typeof useTranslations>;
}) {
  return (
    <>
      {cart.totalItems > 0 && (
        <button
          type="button"
          onClick={() => cart.setIsSheetOpen(true)}
          className="menu-counter w-full text-left"
          aria-label={tm('yourOrder')}
        >
          <div
            className="mx-auto px-4 py-3 sm:py-3.5 flex items-center justify-between"
            style={{ maxWidth: '900px' }}
          >
            <div>
              <div className="menu-counter-label">
                {tm('itemCount', { count: cart.totalItems })}
              </div>
              <div className="menu-counter-sub">{tm('tapToAdd')}</div>
            </div>
            <div className="menu-counter-total">
              {formatPrice(cart.totalPrice, locale)}
            </div>
          </div>
        </button>
      )}

      <OrderSheet
        isOpen={cart.isSheetOpen}
        onClose={() => cart.setIsSheetOpen(false)}
        onClearOrder={cart.clearOrder}
        entries={cart.orderedEntries}
        quantities={cart.quantities}
        onUpdateQuantity={cart.setQuantity}
        locale={locale}
        t={tm}
        tenant={tenant}
      />
    </>
  );
}
