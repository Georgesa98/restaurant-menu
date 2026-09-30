import z from 'zod';
import { translationSchema } from './category';

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);

export const variantSchema = z.object({
  label: z.string('required').trim().min(1).max(100),
  labelEn: z.string().trim().max(100).optional().or(z.literal('')),
  price: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? 0 : Number(v)),
    z.number('required').min(0),
  ),
});

export const itemSchema = z.object({
  categoryId: z.string('required').trim().min(1),
  name: z.string('required').trim().min(1).max(100),
  description: z.string().trim().max(500).optional().or(z.literal('')),
  basePrice: z.preprocess(
    (v) => {
      if (v === '' || v === undefined) return null;
      if (v === null) return null;
      const n = Number(v);
      return Number.isNaN(n) ? v : n;
    },
    z.number().min(0).nullable().optional(),
  ),
  imageUrl: z.preprocess(emptyToNull, z.string().trim().max(500).nullable().optional()),
  isAvailable: z.boolean(),
  displayOrder: z.preprocess(
    (v) => (v === '' || v === undefined || v === null ? 0 : Number(v)),
    z.number().int().min(0),
  ),
  isFeatured: z.boolean(),
  featuredUntil: z.preprocess(emptyToNull, z.string().nullable().optional()),
  variants: z.array(variantSchema).default([]),
  translations: z.record(z.string(), translationSchema),
});

export type ItemFormInput = z.infer<typeof itemSchema>;
export type VariantFormInput = z.infer<typeof variantSchema>;
