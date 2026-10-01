'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getAllTenants } from '@/service';
import { ImportUploader } from '@/components/admin/import-uploader';
import { Label } from '@/components/ui/label';

export default function SuperImportPage() {
  const t = useTranslations('admin');
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loading, setLoading] = useState(true);

  async function getTenants() {
    try {
      const data = await getAllTenants();
      setTenants(data);
      setTenantId((prev) => prev || data[0]?.id || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getTenants();
  }, []);

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">{t('import')}</h1>
      </div>
      {loading ? (
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      ) : (
        <div className="space-y-4">
          <div className="space-y-2 max-w-64">
            <Label>{t('tenant')}</Label>
            <select
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
            >
              {tenants.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          </div>
          {tenantId ? <ImportUploader key={tenantId} tenantId={tenantId} /> : null}
        </div>
      )}
    </div>
  );
}
