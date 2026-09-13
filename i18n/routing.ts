export const locales = ['en', 'ar'] as const;

export const defaultLocale = 'en' as const;

export type Locale = (typeof locales)[number];

export function isLocale(value: string | undefined | null): value is Locale {
  return value === 'en' || value === 'ar';
}
