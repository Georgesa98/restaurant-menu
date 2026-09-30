'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { TenantForm } from '@/components/admin/tenant-form';
import type { TenantFormInput } from '@/lib/validations/tenant';

function toPayload(data: TenantFormInput) {
  return {
    name: data.name,
    slug: data.slug,
    domain: data.domain || null,
    plan: data.plan,
    isActive: data.isActive,
    defaultLocale: data.defaultLocale,
    description: data.description || null,
    address: data.address || null,
    phone: data.phone || null,
    ...data.theme,
  };
}

export default function NewTenantPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  async function onSubmit(data: TenantFormInput) {
    setServerError(null);
    try {
      await api.post('/api/tenants', toPayload(data));
      toast.add({ type: 'success', description: t('createSuccess', { name: data.name }) });
      router.push('/super/tenants');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerError(typeof msg === 'string' ? msg : t('createError', { name: data.name }));
    }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('create')} {t('tenant')}
      </h1>
      <TenantForm serverError={serverError} onSubmit={onSubmit} />
    </>
  );
}
