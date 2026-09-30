'use client';

export type VariantRow = {
  id?: string;
  label: string;
  labelEn: string;
  price: number;
};

export type Item = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  category?: { name: string };
  translations: { locale: string; name: string; description: string | null }[];
  variants: VariantRow[];
};

export type CategoryOption = { id: string; name: string };
