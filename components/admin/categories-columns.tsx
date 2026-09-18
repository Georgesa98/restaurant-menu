'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stickyEnd, type TFn } from './tenants-columns';

export type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
};

export function getCategoryColumns(
  t: TFn,
  actions: { onEdit: (row: CategoryRow) => void; onRemove: (id: string) => void },
): ColumnDef<CategoryRow>[] {
  return [
    {
      accessorKey: 'name',
      header: t('name'),
      cell: ({ row }) => (
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium whitespace-nowrap">
            <span className="size-2 rounded-full bg-primary/60 shrink-0" />
            {row.original.name}
          </span>
          {row.original.description && (
            <span className="block text-xs text-muted-foreground truncate max-w-56">
              {row.original.description}
            </span>
          )}
        </span>
      ),
    },
    {
      accessorKey: 'slug',
      header: t('slug'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
          /{row.original.slug}
        </span>
      ),
    },
    {
      accessorKey: 'displayOrder',
      header: t('displayOrder'),
      cell: ({ row }) => <span className="tabular-nums">{row.original.displayOrder}</span>,
    },
    {
      id: 'actions',
      header: () => <span className="sr-only">{t('actions')}</span>,
      enableSorting: false,
      meta: { className: stickyEnd },
      cell: ({ row }) => (
        <span className="flex justify-end gap-1 whitespace-nowrap">
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
