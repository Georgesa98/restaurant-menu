'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { Button } from '@/components/ui/button';
import { ExportButton } from './export-button';
import { ListTree, UtensilsCrossed, Building2, Upload, LogOut } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const views = ['items', 'categories'] as const;
export type AdminView = (typeof views)[number];

export type ExtendedView = AdminView | 'tenants' | 'import';

const viewIcons: Record<string, ReactNode> = {
  items: <UtensilsCrossed className="size-[18px]" strokeWidth={1.9} />,
  categories: <ListTree className="size-[18px]" strokeWidth={1.9} />,
  tenants: <Building2 className="size-[18px]" strokeWidth={1.9} />,
  import: <Upload className="size-[18px]" strokeWidth={1.9} />,
};

function NavButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className={cn(
        'h-9 w-full justify-start gap-2.5 rounded-xl px-3 text-[13.5px] font-medium',
        active
          ? 'bg-primary/[0.08] text-foreground hover:bg-primary/[0.12]'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
      )}
    >
      {children}
    </Button>
  );
}

export function AdminLayout({
  view,
  onNavigate,
  children,
}: {
  view: string;
  onNavigate: (v: ExtendedView) => void;
  children: ReactNode;
}) {
  const t = useTranslations('admin');
  const { user, signOut } = useAuth();
  const isSuper = user?.role === 'SUPER_ADMIN';

  return (
    <div className="min-h-dvh bg-muted/40 lg:flex">
      <aside className="shrink-0 border-e border-border/70 bg-card lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-64 lg:flex-col">
        <div className="flex items-center gap-2.5 px-4 pb-4 pt-5">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <UtensilsCrossed className="size-[18px]" strokeWidth={2} />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-[15px] font-bold leading-tight tracking-tight">
              MenuHost
            </span>
            <span className="block truncate text-xs text-muted-foreground">{user?.email}</span>
          </span>
        </div>
        <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-1 lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-2.5 lg:pb-4">
          {views.map((v) => (
            <NavButton key={v} active={view === v} onClick={() => onNavigate(v)}>
              {viewIcons[v]}
              {t(v)}
            </NavButton>
          ))}
          {isSuper && (
            <NavButton active={view === 'tenants'} onClick={() => onNavigate('tenants')}>
              <Building2 className="size-[18px]" strokeWidth={1.9} />
              Tenants
            </NavButton>
          )}
          <span className="mx-1 hidden w-px self-stretch bg-border/70 lg:hidden" />
          <span className="lg:hidden">
            <NavButton active={view === 'import'} onClick={() => onNavigate('import')}>
              <Upload className="size-[18px]" strokeWidth={1.9} />
              Import
            </NavButton>
          </span>
        </nav>
        <div className="hidden border-t border-border/70 p-2.5 lg:block">
          <NavButton active={view === 'import'} onClick={() => onNavigate('import')}>
            <Upload className="size-[18px]" strokeWidth={1.9} />
            Import
          </NavButton>
          <ExportButton />
          <button
            onClick={signOut}
            className="flex h-9 w-full items-center gap-2.5 rounded-xl px-3 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="size-[18px]" strokeWidth={1.9} />
            {t('logout')}
          </button>
        </div>
        <div className="flex items-center gap-2 border-t border-border/70 p-2.5 lg:hidden">
          <span className="flex-1">
            <ExportButton />
          </span>
          <Button variant="ghost" size="sm" onClick={signOut} className="h-9 gap-2 rounded-xl px-3">
            <LogOut className="size-4" />
            {t('logout')}
          </Button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
