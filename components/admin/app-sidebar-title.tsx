'use client';

import { useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { SidebarTrigger } from '../ui/sidebar';

export function AppSidebarTitle() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const seg = pathname.split('/')[2] ?? '';
  return (
    <header className="sticky top-0 z-10 border-b border-border/70 bg-background/80 px-4 backdrop-blur sm:px-6 lg:px-10 py-2">
      <div className="flex gap-2 items-center">
        <SidebarTrigger />
        <span>{t(seg)}</span>
      </div>
    </header>
  );
}
