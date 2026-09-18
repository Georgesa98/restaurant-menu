'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DataTable } from './data-table';
import { getUserColumns, type UserRow } from './users-columns';

type Tenant = { id: string; name: string; slug: string };

export function UsersView() {
  const t = useTranslations('admin');
  const [users, setUsers] = useState<UserRow[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Partial<UserRow & { password?: string }> | null>(null);
  const [open, setOpen] = useState(false);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [uRes, tRes] = await Promise.all([api.get('/api/users'), api.get('/api/tenants')]);
      setUsers(uRes.data);
      setTenants(tRes.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setError('');
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);
    try {
      if (editing.id) {
        await api.patch(`/api/users/${editing.id}`, {
          name: data.get('name') as string,
          username: (data.get('username') as string) || null,
          role: data.get('role') as string,
          tenantId: (data.get('tenantId') as string) || null,
        });
      } else {
        await api.post('/api/users', {
          name: data.get('name') as string,
          username: (data.get('username') as string) || undefined,
          email: data.get('email') as string,
          password: data.get('password') as string,
          role: data.get('role') as string,
          tenantId: (data.get('tenantId') as string) || null,
        });
      }
      setOpen(false);
      setEditing(null);
      load();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ?? t('saveFailed');
      setError(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  async function remove(row: UserRow) {
    if (!confirm(t('confirmDeleteUser', { name: row.username ?? row.email }))) return;
    try {
      await api.delete(`/api/users/${row.id}`);
      load();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  async function toggleActive(row: UserRow) {
    const next = !row.isActive;
    if (!next && !confirm(t('confirmDeactivate', { name: row.username ?? row.email }))) return;
    try {
      await api.post(`/api/users/${row.id}/active`, { isActive: next });
      load();
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      alert(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  async function resetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!resetTarget) return;
    setError('');
    try {
      await api.post(`/api/users/${resetTarget.id}/password`, { password: newPassword });
      setResetTarget(null);
      setNewPassword('');
    } catch (err) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  function openEdit(row?: UserRow) {
    setError('');
    setEditing(
      row ?? {
        id: '',
        name: '',
        username: '',
        email: '',
        role: 'TENANT_ADMIN',
        tenantId: tenants[0]?.id ?? '',
      },
    );
    setOpen(true);
  }

  const columns = useMemo(
    () =>
      getUserColumns(t, {
        onEdit: openEdit,
        onResetPassword: (row) => {
          setError('');
          setNewPassword('');
          setResetTarget(row);
        },
        onToggleActive: toggleActive,
        onRemove: remove,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t],
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('users')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('userCount', { count: users.length })}</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addUser')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={users}
        searchKey="username"
        searchPlaceholder={t('searchUsers')}
        isLoading={loading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('user')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[85dvh] overflow-y-auto">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-destructive"
                >
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('username')}</Label>
                  <Input name="username" defaultValue={editing?.username ?? ''} required dir="ltr" />
                </div>
                <div className="space-y-2">
                  <Label>{t('name')}</Label>
                  <Input name="name" defaultValue={editing?.name ?? ''} required dir="auto" />
                </div>
              </div>
              {!editing?.id && (
                <>
                  <div className="space-y-2">
                    <Label>{t('email')}</Label>
                    <Input name="email" type="email" defaultValue={editing?.email ?? ''} required dir="ltr" />
                  </div>
                  <div className="space-y-2">
                    <Label>{t('password')}</Label>
                    <Input name="password" type="password" minLength={8} required autoComplete="new-password" />
                  </div>
                </>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('role')}</Label>
                  <select
                    name="role"
                    defaultValue={editing?.role ?? 'TENANT_ADMIN'}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="TENANT_ADMIN">{t('tenantAdmin')}</option>
                    <option value="SUPER_ADMIN">{t('superAdmin')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('tenant')}</Label>
                  <select
                    name="tenantId"
                    defaultValue={editing?.tenantId ?? ''}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="">{t('noTenant')}</option>
                    {tenants.map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!resetTarget}
        onOpenChange={(v) => {
          if (!v) {
            setResetTarget(null);
            setNewPassword('');
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <form onSubmit={resetPassword}>
            <DialogHeader>
              <DialogTitle>{t('resetPassword')}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-destructive"
                >
                  {error}
                </div>
              )}
              <p className="text-sm text-muted-foreground">
                {t('resetPasswordFor', { name: resetTarget?.username ?? resetTarget?.email ?? '' })}
              </p>
              <div className="space-y-2">
                <Label>{t('newPassword')}</Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  required
                  autoComplete="new-password"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
