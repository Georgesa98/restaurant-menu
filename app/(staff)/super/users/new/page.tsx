'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { UserForm, type TenantOption } from '@/components/admin/user-form';
import type { CreateUserInput } from '@/lib/validations/user';

export default function NewUserPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  async function getTenants() {
    try {
      const res = await api.get('/api/tenants');
      setTenants(res.data);
    } finally {
      setTenantsLoading(false);
    }
  }

  useEffect(() => {
    getTenants();
  }, []);

  async function onSubmit(data: CreateUserInput) {
    setServerError(null);
    try {
      await api.post('/api/users', {
        name: data.name,
        username: data.username || undefined,
        email: data.email,
        password: data.password,
        role: data.role,
        tenantId: data.tenantId,
      });
      toast.add({ type: 'success', description: t('createSuccess', { name: data.name }) });
      router.push('/super/users');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerError(typeof msg === 'string' ? msg : t('createError', { name: data.name }));
    }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('create')} {t('user')}
      </h1>
      {tenantsLoading ? (
        <p>{t('loading')}</p>
      ) : (
        <UserForm tenants={tenants} isCreate serverError={serverError} onSubmit={onSubmit} />
      )}
    </>
  );
}
