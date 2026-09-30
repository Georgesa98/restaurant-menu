'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { UserForm, type TenantOption } from '@/components/admin/user-form';
import type { EditUserInput } from '@/lib/validations/user';
import type { UserRow } from '@/components/admin/users-columns';

export default function EditUserPage() {
  const { id: userId } = useParams();
  const t = useTranslations('admin');
  const router = useRouter();
  const [user, setUser] = useState<UserRow | null>(null);
  const [tenants, setTenants] = useState<TenantOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [tenantsLoading, setTenantsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  async function getUser() {
    if (!userId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/api/users/${userId}`);
      setUser(res.data);
    } finally {
      setIsLoading(false);
    }
  }

  async function getTenants() {
    try {
      const res = await api.get('/api/tenants');
      setTenants(res.data);
    } finally {
      setTenantsLoading(false);
    }
  }

  useEffect(() => {
    getUser();
  }, [userId]);

  useEffect(() => {
    getTenants();
  }, []);

  async function onSubmit(data: EditUserInput) {
    if (!user) return;
    setServerError(null);
    try {
      await api.patch(`/api/users/${user.id}`, {
        name: data.name,
        username: data.username,
        role: data.role,
        tenantId: data.tenantId,
      });
      toast.add({ type: 'success', description: t('editSuccess', { name: data.name }) });
      router.push('/super/users');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setServerError(typeof msg === 'string' ? msg : t('editError', { name: data.name }));
    }
  }

  if (isLoading || tenantsLoading) return <p>{t('loading')}</p>;
  if (!user) return <p>Not Found</p>;

  const initialValues: EditUserInput = {
    name: user.name,
    username: user.username,
    role: user.role as 'TENANT_ADMIN' | 'SUPER_ADMIN',
    tenantId: user.tenantId,
  };

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('edit')} {t('user')}
      </h1>
      <UserForm
        initialValues={initialValues}
        tenants={tenants}
        isCreate={false}
        serverError={serverError}
        onSubmit={onSubmit}
      />
    </>
  );
}
