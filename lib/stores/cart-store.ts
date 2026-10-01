'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { TenantData } from '@/lib/types';
import { resolveTranslation } from '@/components/menu/menu-helpers';
import type { OrderedEntry } from '@/components/menu/menu-helpers';

export type Quantities = Record<string, number>;
export type SelectedVariants = Record<string, string>;

type Categories = TenantData['categories'];
type MenuItem = Categories[number]['items'][number];

const PERSIST_KEY = 'menu-order-v1';

const EMPTY_QUANTITIES: Quantities = {};
const EMPTY_VARIANTS: SelectedVariants = {};

export function qtyKeyFor(item: MenuItem, selectedVariants: SelectedVariants): string {
  if (item.variants.length > 0) {
    const vid = selectedVariants[item.id] ?? item.variants[0].id;
    return `${item.id}:${vid}`;
  }
  return item.id;
}

export function getTotalItems(quantities: Quantities): number {
  let count = 0;
  for (const q of Object.values(quantities)) count += q;
  return count;
}

export function getCartTotals(
  quantities: Quantities,
  categories: Categories,
  locale: string,
): { totalItems: number; totalPrice: number; orderedEntries: OrderedEntry[] } {
  const isRtl = locale === 'ar';
  const byItemId = new Map<string, { cat: Categories[number]; item: MenuItem }>();
  for (const cat of categories) {
    for (const item of cat.items) {
      if (!byItemId.has(item.id)) byItemId.set(item.id, { cat, item });
    }
  }

  let totalPrice = 0;
  let totalItems = 0;
  const orderedEntries: OrderedEntry[] = [];

  for (const [key, q] of Object.entries(quantities)) {
    if (q <= 0) continue;
    const sep = key.indexOf(':');
    const itemId = sep === -1 ? key : key.slice(0, sep);
    const variantId = sep === -1 ? undefined : key.slice(sep + 1);
    const found = byItemId.get(itemId);
    if (!found) continue;
    const { cat, item } = found;
    const catTrans = resolveTranslation(cat, locale);
    const itemTrans = resolveTranslation(item, locale);
    let price = 0;
    let label = itemTrans.name;
    if (variantId) {
      const v = item.variants.find((vv) => vv.id === variantId);
      if (!v) continue;
      price = Number(v.price);
      const vLabel = isRtl ? v.label : v.labelEn;
      label = `${itemTrans.name} — ${vLabel}`;
    } else {
      price = item.basePrice ? Number(item.basePrice) : 0;
    }
    totalItems += q;
    totalPrice += price * q;
    orderedEntries.push({ key, itemId, variantId, label, price, categoryName: catTrans.name });
  }

  return { totalItems, totalPrice, orderedEntries };
}

interface CartState {
  activeSlug: string;
  cartsBySlug: Record<string, Quantities>;
  variantsBySlug: Record<string, SelectedVariants>;
  isSheetOpen: boolean;
  hasHydrated: boolean;
  init: (slug: string) => void;
  setQuantity: (key: string, delta: number) => void;
  selectVariant: (itemId: string, variantId: string) => void;
  ensureVariantDefaults: (categories: Categories) => void;
  clearOrder: () => void;
  setSheetOpen: (open: boolean) => void;
  setHasHydrated: (value: boolean) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      activeSlug: '',
      cartsBySlug: {},
      variantsBySlug: {},
      isSheetOpen: false,
      hasHydrated: false,

      init: (slug) => {
        const { activeSlug, cartsBySlug } = get();
        if (activeSlug === slug) return;
        set({
          activeSlug: slug,
          cartsBySlug: cartsBySlug[slug] ? cartsBySlug : { ...cartsBySlug, [slug]: {} },
          isSheetOpen: false,
        });
      },

      setQuantity: (key, delta) => {
        const { activeSlug, cartsBySlug } = get();
        if (!activeSlug) return;
        const current = cartsBySlug[activeSlug] ?? {};
        const updated = (current[key] ?? 0) + delta;
        const next = { ...current };
        if (updated <= 0) delete next[key];
        else next[key] = updated;
        set({ cartsBySlug: { ...cartsBySlug, [activeSlug]: next } });
      },

      selectVariant: (itemId, variantId) => {
        const { activeSlug, variantsBySlug } = get();
        if (!activeSlug) return;
        const current = variantsBySlug[activeSlug] ?? {};
        if (current[itemId] === variantId) return;
        set({
          variantsBySlug: { ...variantsBySlug, [activeSlug]: { ...current, [itemId]: variantId } },
        });
      },

      ensureVariantDefaults: (categories) => {
        const { activeSlug, variantsBySlug } = get();
        if (!activeSlug) return;
        const current = variantsBySlug[activeSlug] ?? {};
        let changed = false;
        const next = { ...current };
        for (const cat of categories) {
          for (const item of cat.items) {
            if (item.variants.length > 0 && item.isAvailable && !next[item.id]) {
              next[item.id] = item.variants[0].id;
              changed = true;
            }
          }
        }
        if (changed || !variantsBySlug[activeSlug]) {
          set({ variantsBySlug: { ...variantsBySlug, [activeSlug]: next } });
        }
      },

      clearOrder: () => {
        const { activeSlug, cartsBySlug } = get();
        if (!activeSlug) return;
        set({
          cartsBySlug: { ...cartsBySlug, [activeSlug]: {} },
          isSheetOpen: false,
        });
      },

      setSheetOpen: (open) => {
        if (get().isSheetOpen === open) return;
        set({ isSheetOpen: open });
      },

      setHasHydrated: (value) => {
        if (get().hasHydrated === value) return;
        set({ hasHydrated: value });
      },
    }),
    {
      name: PERSIST_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ cartsBySlug: s.cartsBySlug, variantsBySlug: s.variantsBySlug }),
      onRehydrateStorage: () => (state, error) => {
        if (error) return;
        state?.setHasHydrated(true);
      },
    },
  ),
);

export function useCartQuantities(): Quantities {
  return useCartStore((s) =>
    s.activeSlug ? (s.cartsBySlug[s.activeSlug] ?? EMPTY_QUANTITIES) : EMPTY_QUANTITIES,
  );
}

export function useCartSelectedVariants(): SelectedVariants {
  return useCartStore((s) =>
    s.activeSlug ? (s.variantsBySlug[s.activeSlug] ?? EMPTY_VARIANTS) : EMPTY_VARIANTS,
  );
}
