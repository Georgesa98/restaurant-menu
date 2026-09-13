'use server';

import { cookies } from 'next/headers';
import { isLocale, type Locale } from './routing';

export async function setUserLocale(locale: Locale) {
  if (!isLocale(locale)) return;
  const store = await cookies();
  store.set('locale', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  });
}
