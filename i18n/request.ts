import { getRequestConfig } from 'next-intl/server';
import { cookies, headers } from 'next/headers';
import { defaultLocale, isLocale } from './routing';

function localeFromAcceptLanguage(value: string | null): string | null {
  if (!value) return null;
  const first = value.split(',')[0]?.trim().toLowerCase() ?? '';
  if (first.startsWith('ar')) return 'ar';
  if (first.startsWith('en')) return 'en';
  return null;
}

export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get('locale')?.value;

  let locale: string;
  if (cookieLocale && isLocale(cookieLocale)) {
    locale = cookieLocale;
  } else {
    const headerList = await headers();
    locale = localeFromAcceptLanguage(headerList.get('accept-language')) ?? defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
