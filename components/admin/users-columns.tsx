'use client';

import type { ColumnDef } from '@tanstack/react-table';
import { KeyRound, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { stickyEnd, type TFn } from './tenants-columns';

export type UserRow = {
  id: string;
  email: string;
  name: string;
  username: string | null;
  role: string;
  tenantId: string | null;
  isActive: boolean;
  createdAt: string;
  tenant: { name: string; slug: string } | null;
};

export function getUserColumns(
  t: TFn,
  actions: {
    onEdit: (row: UserRow) => void;
    onResetPassword: (row: UserRow) => void;
    onToggleActive: (row: UserRow) => void;
    onRemove: (row: UserRow) => void;
  },
): ColumnDef<UserRow>[] {
  return [
    {
      accessorKey: 'username',
      header: t('username'),
      cell: ({ row }) => (
        <span className="min-w-0">
          <span className="flex items-center gap-2 font-medium whitespace-nowrap" dir="auto">
            <span
              className={`size-2 rounded-full shrink-0 ${row.original.isActive ? 'bg-green-500' : 'bg-muted-foreground/30'}`}
            />
            {row.original.username ?? '—'}
          </span>
          <span className="block text-xs text-muted-foreground truncate max-w-48">{row.original.name}</span>
        </span>
      ),
    },
    {
      accessorKey: 'email',
      header: t('email'),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground whitespace-nowrap" dir="ltr">
          {row.original.email}
        </span>
      ),
    },
    {
      accessorKey: 'role',
      header: t('role'),
      cell: ({ row }) => (
        <span className="text-[11px] font-medium uppercase tracking-wider px-1.5 py-0.5 rounded bg-muted text-muted-foreground whitespace-nowrap">
          {row.original.role === 'SUPER_ADMIN' ? t('superAdmin') : t('tenantAdmin')}
        </span>
      ),
    },
    {
      id: 'tenant',
      header: t('tenant'),
      cell: ({ row }) => (
        <span className="text-xs whitespace-nowrap">{row.original.tenant?.name ?? '—'}</span>
      ),
    },
    {
      id: 'status',
      header: t('status'),
      cell: ({ row }) =>
        row.original.isActive ? (
          <span className="text-xs text-green-600 whitespace-nowrap">{t('active')}</span>
        ) : (
          <span className="text-xs text-muted-foreground whitespace-nowrap">{t('deactivated')}</span>
        ),
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
            onClick={() => actions.onResetPassword(row.original)}
            aria-label={t('resetPassword')}
            title={t('resetPassword')}
          >
            <KeyRound className="size-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => actions.onToggleActive(row.original)}
            aria-label={row.original.isActive ? t('deactivate') : t('reactivate')}
            title={row.original.isActive ? t('deactivate') : t('reactivate')}
          >
            {row.original.isActive ? <PowerOff className="size-3.5" /> : <Power className="size-3.5" />}
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={() => actions.onRemove(row.original)}
            aria-label={t('delete')}
          >
            <Trash2 className="size-3.5 text-destructive" />
          </Button>
        </span>
      ),
    },
  ];
}
