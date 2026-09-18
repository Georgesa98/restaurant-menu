'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import type { TenantData } from '@/lib/types';
import { resolveTranslation } from './menu-helpers';
import type { OrderedEntry } from './menu-helpers';

export type Ripple = { id: number; itemId: string; x: number; y: number };

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

export function qtyKeyFor(
  item: TenantData['categories'][number]['items'][number],
  selectedVariants: Map<string, string>,
): string {
  if (item.variants.length > 0) {
    const vid = selectedVariants.get(item.id) ?? item.variants[0].id;
    return `${item.id}:${vid}`;
  }
  return item.id;
}

/**
 * Shared order state (quantities, variant picks, ripples, totals, sheet).
 * Used by both the category landing and the category detail page so the
 * order survives navigation between them (per tenant slug, localStorage).
 */
export function useOrderCart(
  tenantSlug: string,
  categories: TenantData['categories'],
  locale: string,
) {
  const [quantities, setQuantities] = useState<Map<string, number>>(() =>
    loadQuantities(tenantSlug),
  );

  const [selectedVariants, setSelectedVariants] = useState<Map<string, string>>(() => {
    const map = new Map<string, string>();
    for (const cat of categories) {
      for (const item of cat.items) {
        if (item.variants.length > 0 && item.isAvailable) {
          map.set(item.id, item.variants[0].id);
        }
      }
    }
    return map;
  });

  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const isRtl = locale === 'ar';

  useEffect(() => {
    saveQuantities(tenantSlug, quantities);
  }, [tenantSlug, quantities]);

  const clearOrder = useCallback(() => {
    setQuantities(new Map());
    setIsSheetOpen(false);
  }, []);

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

  function handleIncrement(
    event: React.MouseEvent<HTMLButtonElement>,
    key: string,
    itemId: string,
  ) {
    setQuantity(key, 1);
    addRipple(event, itemId);
  }

  const selectVariant = useCallback((itemId: string, variantId: string) => {
    setSelectedVariants((prev) => {
      const next = new Map(prev);
      next.set(itemId, variantId);
      return next;
    });
  }, []);

  const totalItems = useMemo(() => {
    let count = 0;
    for (const q of quantities.values()) count += q;
    return count;
  }, [quantities]);

  const totalPrice = useMemo(() => {
    let total = 0;
    for (const [key, q] of quantities) {
      const [itemId, variantId] = key.split(':');
      for (const cat of categories) {
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
  }, [quantities, categories]);

  const orderedEntries = useMemo(() => {
    const result: OrderedEntry[] = [];
    for (const [key, q] of quantities) {
      if (q <= 0) continue;
      const [itemId, variantId] = key.split(':');
      for (const cat of categories) {
        const item = cat.items.find((i) => i.id === itemId);
        if (item) {
          const catTrans = resolveTranslation(cat, locale);
          const itemTrans = resolveTranslation(item, locale);
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
  }, [quantities, categories, locale, isRtl]);

  return {
    quantities,
    selectedVariants,
    selectVariant,
    setQuantity,
    handleIncrement,
    ripples,
    totalItems,
    totalPrice,
    orderedEntries,
    isSheetOpen,
    setIsSheetOpen,
    clearOrder,
    isRtl,
  };
}

export type OrderCart = ReturnType<typeof useOrderCart>;
