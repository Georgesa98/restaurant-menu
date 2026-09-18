'use client';

import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from '@tanstack/react-table';
import { useTranslations } from 'next-intl';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

export function PagerControls({
  page,
  pageCount,
  onPage,
  pageSize,
  onPageSize,
  pageSizeOptions = [10, 20, 50],
}: {
  page: number;
  pageCount: number;
  onPage: (page: number) => void;
  pageSize: number;
  onPageSize: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  const t = useTranslations('admin');
  if (pageCount <= 1 && pageSizeOptions.length === 0) return null;
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 py-3">
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="xs" onClick={() => onPage(0)} disabled={page === 0} aria-label={t('firstPage')}>
          <ChevronsLeft className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPage(page - 1)}
          disabled={page === 0}
          aria-label={t('prevPage')}
        >
          <ChevronLeft className="size-4 rtl:rotate-180" />
        </Button>
        <span className="px-2 text-xs text-muted-foreground tabular-nums">
          {t('pageOf', { page: pageCount === 0 ? 0 : page + 1, pages: pageCount })}
        </span>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPage(page + 1)}
          disabled={page + 1 >= pageCount}
          aria-label={t('nextPage')}
        >
          <ChevronRight className="size-4 rtl:rotate-180" />
        </Button>
        <Button
          variant="ghost"
          size="xs"
          onClick={() => onPage(pageCount - 1)}
          disabled={page + 1 >= pageCount}
          aria-label={t('lastPage')}
        >
          <ChevronsRight className="size-4 rtl:rotate-180" />
        </Button>
      </div>
      <div className="ms-auto flex items-center gap-2">
        <span className="text-xs text-muted-foreground">{t('rowsPerPage')}</span>
        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {pageSizeOptions.map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export function DataTable<T>({
  columns,
  data,
  searchKey,
  searchPlaceholder,
  initialPageSize = 10,
  emptyText,
  isLoading,
}: {
  columns: ColumnDef<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  initialPageSize?: number;
  emptyText?: string;
  isLoading?: boolean;
}) {
  const t = useTranslations('admin');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: initialPageSize });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-2">
      {searchKey && (
        <Input
          placeholder={searchPlaceholder ?? t('search')}
          value={(table.getColumn(searchKey)?.getFilterValue() as string) ?? ''}
          onChange={(e) => {
            table.getColumn(searchKey)?.setFilterValue(e.target.value);
            table.setPageIndex(0);
          }}
          className="max-w-64"
        />
      )}
      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/5 bg-card">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b border-border/70">
                {hg.headers.map((h) => (
                  <th
                    key={h.id}
                    className={cn(
                      'px-3 py-2.5 text-start text-xs font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap',
                      h.column.getCanSort() && 'cursor-pointer select-none',
                      (h.column.columnDef.meta as { className?: string } | undefined)?.className,
                    )}
                    onClick={h.column.getToggleSortingHandler()}
                  >
                    {h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}
                    {{ asc: ' ↑', desc: ' ↓' }[h.column.getIsSorted() as string] ?? null}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  {t('loading')}
                </td>
              </tr>
            ) : table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                  {emptyText ?? t('noResults')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-muted/40">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        'px-3 py-2.5 align-middle',
                        (cell.column.columnDef.meta as { className?: string } | undefined)?.className,
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <PagerControls
        page={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        onPage={(p) => table.setPageIndex(p)}
        pageSize={table.getState().pagination.pageSize}
        onPageSize={(s) => {
          table.setPageSize(s);
          table.setPageIndex(0);
        }}
      />
    </div>
  );
}
