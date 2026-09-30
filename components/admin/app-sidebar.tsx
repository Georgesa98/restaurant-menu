'use client';

import { Building, Import, ListTree, LogOut, User, UtensilsCrossed } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '../ui/sidebar';
import { useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { ExportButton } from './export-button';
import { LocaleToggleButton } from './locale-toggle-button';
import { useAuth } from './auth-provider';

export function AppSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();
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
      ];
  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div>
          <UtensilsCrossed />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton isActive={isActive} onClick={() => router.push(item.href)}>
                  <item.icon />
                  <span>{t(item.key)}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={pathname.startsWith(importHref)}
              onClick={() => router.push(importHref)}
            >
              <Import />
              <span>{t('import')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <ExportButton />
          <LocaleToggleButton />
          <SidebarMenuItem>
            <SidebarMenuButton tooltip={t('logout')} onClick={signOut}>
              <LogOut strokeWidth={1.9} />
              <span>{t('logout')}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
