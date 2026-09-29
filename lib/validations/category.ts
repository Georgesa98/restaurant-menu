import z from 'zod';

export const translationSchema = z.object({
  name: z.string('required').trim().max(100),
  description: z.string('required').trim().max(500).optional(),
});

export const categorySchema = z.object({
  name: z.string('required').trim().min(1).max(100),
  slug: z
    .string('required')
    .trim()
    .min(1)
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'invalidSlug'),
  description: z.string().trim().max(500).optional(),
  isActive: z.boolean(),
  translations: z.record(z.string(), translationSchema),
});

export type CategoryFormInput = z.infer<typeof categorySchema>;
