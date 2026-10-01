'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { deleteTenant, exportMenu, getAllTenants, requestTenantSync } from '@/service';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { TenantImportDialog } from '@/components/admin/tenant-import-dialog';
import { getTenantColumns, type TenantRow } from '@/components/admin/tenants-columns';

export default function SuperTenantsPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [importRow, setImportRow] = useState<TenantRow | null>(null);

  async function getTenants() {
    setLoading(true);
    try {
      setTenants(await getAllTenants());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTenants();
  }, []);

  async function removeTenant(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await deleteTenant(id);
    getTenants();
  }

  async function requestSync(row: TenantRow) {
    await requestTenantSync(row.id);
    getTenants();
  }

  async function exportTenant(row: TenantRow) {
    try {
      const blob = await exportMenu(row.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${row.name}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed — check console');
    }
  }

  const columns = useMemo(
    () =>
      getTenantColumns(t, {
        onEdit: (row) => router.push(`/super/tenants/${row.id}/edit`),
        onTheme: (row) => router.push(`/super/themes/${row.id}`),
        onImport: setImportRow,
        onExport: exportTenant,
        onRemove: removeTenant,
        onRequestSync: requestSync,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenants, t],
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('tenants')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('tenantCount', { count: tenants.length })}</p>
        </div>
        <Button onClick={() => router.push('/super/tenants/new')}>
          <Plus className="size-4" />
          {t('addTenant')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        searchKey="name"
        searchPlaceholder={t('searchTenants')}
        isLoading={loading}
      />

      <TenantImportDialog row={importRow} onClose={() => setImportRow(null)} />
    </div>
  );
}
