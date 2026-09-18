'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type TenantRow = {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  plan: string;
  isActive: boolean;
  revision: number;
  syncRequired: boolean;
  _count: { categories: number; items: number };
};

export const stickyEnd = 'sticky end-0 bg-card shadow-[-8px_0_12px_-8px_rgba(0,0,0,0.15)] rtl:shadow-[8px_0_12px_-8px_rgba(0,0,0,0.15)]';

export type TFn = (key: string, values?: Record<string, string | number>) => string;

export function getTenantColumns(
  t: TFn,
  actions: {
    onEdit: (row: TenantRow) => void;
    onRemove: (id: string) => void;
    onRequestSync: (row: TenantRow) => void;
  },
): ColumnDef<TenantRow>[] {
  return [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium whitespace-nowrap">
            <span
              className={`size-2 rounded-full shrink-0 ${row.original.isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
            />
            {row.original.name}
          </span>
          <span className="block text-xs text-muted-foreground">/{row.original.slug}</span>
        </span>
      ),
    },
    {
      accessorKey: 'plan',
      header: t('plan'),
      cell: ({ row }) => (
        <span className="text-[11px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
          {row.original.plan}
        </span>
      ),
    },
    {
      id: 'counts',
      header: t('content'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap tabular-nums">
          {t('categoryCount', { count: row.original._count.categories })} ·{' '}
          {t('itemCount', { count: row.original._count.items })}
        </span>
      ),
    },
    {
      id: 'sync',
      header: t('sync'),
      cell: ({ row }) => (
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground whitespace-nowrap tabular-nums">
          <span
            className={`size-2 rounded-full shrink-0 ${row.original.syncRequired ? 'bg-amber' : 'bg-green-500'}`}
            title={row.original.syncRequired ? t('syncRequired') : t('inSync')}
          />
          rev {row.original.revision}
        </span>
      ),
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('actions')}</span>,
      enableSorting: false,
      meta: { className: stickyEnd },
      cell: ({ row }) => (
        <span className="flex justify-end gap-1 whitespace-nowrap">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => actions.onRequestSync(row.original)}
            aria-label={t('requestSync')}
            title={t('requestSync')}
          >
            <RefreshCw className="size-3.5" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => actions.onEdit(row.original)} aria-label={t('edit')}>
            <Pencil className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => actions.onRemove(row.original.id)}
            aria-label={t('delete')}
          >
            <Trash2 className="size-3.5" />
          </Button>
        </span>
      ),
    },
  ];
}
