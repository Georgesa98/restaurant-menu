'use client';

import { Building, Import, ListTree, LogOut, Palette, User, UtensilsCrossed } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from '../ui/sidebar';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ExportButton } from './export-button';
import { LocaleToggleButton } from './locale-toggle-button';
import { useAuth } from './auth-provider';

export function AppSidebar() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const isSuper = pathname.startsWith('/super');
  const importHref = isSuper ? '/super/import' : '/admin/import';
  const navItems = isSuper
    ? [
        {
          key: 'tenants',
          href: '/super/tenants',
          icon: Building,
        },
        {
          key: 'users',
          href: '/super/users',
          icon: User,
        },
      ]
    : [
        {
          key: 'items',
          href: '/admin/items',
          icon: UtensilsCrossed,
        },
        {
          key: 'categories',
          href: '/admin/categories',
          icon: ListTree,
        },
        {
          key: 'themes',
          href: '/admin/themes',
          icon: Palette,
        },
      ];
  return (
    <Sidebar variant="inset" side={locale === 'ar' ? 'right' : 'left'}>
      <SidebarHeader className="px-3 pt-3">
        <div className="flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 p-2.5 ring-1 ring-sidebar-border">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-4.5" />
          </div>
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold">
              {user?.displayUsername || user?.username || user?.name || '—'}
            </p>
            <p className="truncate text-[11px] text-sidebar-foreground/60">
              {user?.email ?? ''}
            </p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-2 py-2">
        <SidebarMenu className="gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  isActive={isActive}
                  onClick={() => router.push(item.href)}
                  className={cn(
                    'relative rounded-lg transition-colors',
                    'before:absolute before:start-0 before:top-2 before:bottom-2 before:w-1 before:rounded-e-full before:bg-primary before:opacity-0 before:transition-opacity',
                    isActive && 'bg-sidebar-accent font-medium before:opacity-100',
                  )}
                >
                  <item.icon />
                  <span>{t(item.key)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="gap-1 px-3 pb-3">
        <SidebarMenu className="gap-1">
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith(importHref)}
              onClick={() => router.push(importHref)}
              className={cn(
                'relative rounded-lg transition-colors',
                'before:absolute before:start-0 before:top-2 before:bottom-2 before:w-1 before:rounded-e-full before:bg-primary before:opacity-0 before:transition-opacity',
                pathname.startsWith(importHref) && 'bg-sidebar-accent font-medium before:opacity-100',
              )}
            >
              <Import />
              <span>{t('import')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <ExportButton />
          <LocaleToggleButton />
          <SidebarSeparator className="my-1" />
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip={t('logout')}
              onClick={signOut}
              className="rounded-lg text-sidebar-foreground/70 transition-colors hover:text-sidebar-accent-foreground"
            >
              <LogOut strokeWidth={1.9} />
              <span>{t('logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
