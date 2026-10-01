import z from 'zod';

const emptyToNull = (v: unknown) => (v === '' || v === undefined ? null : v);

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const themeTokensSchema = z.object({
  primaryColor: z.string().trim().min(1).max(50),
  secondaryColor: z.string().trim().min(1).max(50),
  accentColor: z.string().trim().min(1).max(50),
  backgroundColor: z.string().trim().min(1).max(50),
  surfaceColor: z.string().trim().min(1).max(50),
  textColor: z.string().trim().min(1).max(50),
  textMuted: z.string().trim().min(1).max(50),
  headingFont: z.string().trim().min(1).max(200),
  bodyFont: z.string().trim().min(1).max(200),
  borderRadiusSm: z.string().trim().min(1).max(20),
  borderRadiusMd: z.string().trim().min(1).max(20),
  borderRadiusLg: z.string().trim().min(1).max(20),
  shadow: z.string().trim().max(200),
});

export const tenantSchema = z.object({
  name: z.string('required').trim().min(1).max(100),
  slug: z.string('required').trim().min(1).max(100),
  domain: z.preprocess(emptyToNull, z.string().trim().max(255).nullable().optional()),
  plan: z.enum(['FREE', 'STARTER', 'PRO']),
  isActive: z.boolean(),
  defaultLocale: z.enum(['en', 'ar']),
  description: optionalText(500),
  address: optionalText(255),
  phone: optionalText(50),
  theme: themeTokensSchema,
});

export type TenantFormInput = z.infer<typeof tenantSchema>;
export type ThemeTokensInput = z.infer<typeof themeTokensSchema>;

// Themes page payload: identity + design tokens + the three layout fields.
export const themeUpdateSchema = themeTokensSchema.extend({
  name: z.string('required').trim().min(1).max(100),
  description: optionalText(500),
  cardStyle: z.enum(['elevated', 'bordered']),
  menuLayout: z.enum(['auto-fit', 'single']),
  spacing: z.enum(['comfortable', 'compact']),
});

export type ThemeUpdateInput = z.infer<typeof themeUpdateSchema>;
