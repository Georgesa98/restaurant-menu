'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { FleetPanel } from '@/components/admin/fleet-panel';
import { getTenantColumns, type TenantRow } from '@/components/admin/tenants-columns';

export default function SuperTenantsPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function getTenants() {
    setLoading(true);
    try {
      const res = await api.get('/api/tenants');
      setTenants(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTenants();
  }, []);

  async function deleteTenant(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/api/tenants/${id}`);
    getTenants();
  }

  async function requestSync(row: TenantRow) {
    await api.post(`/api/tenants/${row.id}/request-sync`);
    getTenants();
  }

  const columns = useMemo(
    () =>
      getTenantColumns(t, {
        onEdit: (row) => router.push(`/super/tenants/${row.id}/edit`),
        onRemove: deleteTenant,
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

      <FleetPanel tenants={tenants} />
    </div>
  );
}
