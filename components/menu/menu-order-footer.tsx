'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { TenantData } from '@/lib/types';
import { formatPrice } from './menu-helpers';
import { getCartTotals, useCartQuantities, useCartStore } from '@/lib/stores/cart-store';
import { OrderSheet } from './order-sheet';

/** Sticky bottom order counter + order sheet, shared by home and detail. */
export function MenuOrderFooter({
  tenant,
  locale,
  tm,
}: {
  tenant: TenantData;
  locale: string;
  tm: ReturnType<typeof useTranslations>;
}) {
  const quantities = useCartQuantities();
  const { isSheetOpen, setSheetOpen } = useCartStore();

  const { totalItems, totalPrice } = useMemo(
    () => getCartTotals(quantities, tenant.categories, locale),
    [quantities, tenant.categories, locale],
  );

  return (
    <>
      {totalItems > 0 && (
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className="menu-counter w-full text-left"
          aria-label={tm('yourOrder')}
        >
          <div
            className="mx-auto px-4 py-3 @sm:py-3.5 flex items-center justify-between"
            style={{ maxWidth: '900px' }}
          >
            <div>
              <div className="menu-counter-label">{tm('itemCount', { count: totalItems })}</div>
              <div className="menu-counter-sub">{tm('tapToAdd')}</div>
            </div>
            <div className="menu-counter-total">{formatPrice(totalPrice, locale)}</div>
          </div>
        </button>
      )}

      <OrderSheet isOpen={isSheetOpen} onClose={() => setSheetOpen(false)} locale={locale} t={tm} tenant={tenant} />
    </>
  );
}
