'use client';

import { setUserLocale } from '@/i18n/locale';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar';
import { Languages } from 'lucide-react';

function useLocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const otherLocale = locale === 'ar' ? 'en' : 'ar';

  function switchLocale() {
    startTransition(async () => {
      await setUserLocale(otherLocale);
      document.documentElement.lang = otherLocale;
      document.documentElement.dir = otherLocale === 'ar' ? 'rtl' : 'ltr';
      router.refresh();
    });
  }

  return { locale, otherLocale, isPending, switchLocale };
}

export function LocaleToggleButton() {
  const tNav = useTranslations('nav');
  const { otherLocale, isPending, switchLocale } = useLocaleSwitcher();

  return (
    <SidebarMenuItem>
      <SidebarMenuButton tooltip={tNav('language')} onClick={switchLocale} disabled={isPending}>
        <Languages strokeWidth={1.9} />
        <span>{otherLocale === 'ar' ? 'العربية' : 'English'}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
