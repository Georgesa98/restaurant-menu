'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { setUserLocale } from '@/i18n/locale';
import type { Locale } from '@/i18n/routing';

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const otherLocale: Locale = locale === 'ar' ? 'en' : 'ar';
  const label = otherLocale === 'ar' ? 'العربية' : 'English';

  function switchLocale() {
    startTransition(async () => {
      await setUserLocale(otherLocale);
      document.documentElement.lang = otherLocale;
      document.documentElement.dir = otherLocale === 'ar' ? 'rtl' : 'ltr';
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={switchLocale}
      disabled={isPending}
      className="inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded-[var(--radius-sm)] transition-colors hover:opacity-80 disabled:opacity-50"
      style={{
        background: 'color-mix(in srgb, var(--text-muted) 10%, transparent)',
        color: 'var(--text-muted)',
      }}
    >
      {label}
    </button>
  );
}
