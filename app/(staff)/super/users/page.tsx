'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ApiError, deleteUser, getAllUsers, resetUserPassword, setUserActive } from '@/service';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DataTable } from '@/components/admin/data-table';
import { getUserColumns, type UserRow } from '@/components/admin/users-columns';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validations/user';

export default function SuperUsersPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [resetTarget, setResetTarget] = useState<UserRow | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const {
    handleSubmit: handleResetSubmit,
    control: resetControl,
    reset: resetResetForm,
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema) as any,
    defaultValues: { password: '' },
  });

  async function getUsers() {
    setLoading(true);
    try {
      setUsers(await getAllUsers());
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getUsers();
  }, []);

  async function removeUser(row: UserRow) {
    if (!confirm(t('confirmDeleteUser', { name: row.username ?? row.email }))) return;
    try {
      await deleteUser(row.id);
      getUsers();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : undefined;
      alert(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  async function toggleActive(row: UserRow) {
    const next = !row.isActive;
    if (!next && !confirm(t('confirmDeactivate', { name: row.username ?? row.email }))) return;
    try {
      await setUserActive(row.id, next);
      getUsers();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : undefined;
      alert(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  async function resetPassword(data: ResetPasswordInput) {
    if (!resetTarget) return;
    setError('');
    try {
      await resetUserPassword(resetTarget.id, data.password);
      toast.add({
        type: 'success',
        description: t('editSuccess', { name: resetTarget.username ?? resetTarget.email }),
      });
      setResetTarget(null);
      resetResetForm();
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : undefined;
      setError(typeof msg === 'string' ? msg : t('saveFailed'));
    }
  }

  const columns = useMemo(
    () =>
      getUserColumns(t, {
        onEdit: (row) => router.push(`/super/users/${row.id}/edit`),
        onResetPassword: (row) => {
          setError('');
          resetResetForm();
          setResetTarget(row);
        },
        onToggleActive: toggleActive,
        onRemove: removeUser,
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
        <Button onClick={() => router.push('/super/users/new')}>
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

      <Dialog
        open={!!resetTarget}
        onOpenChange={(v) => {
          if (!v) {
            setResetTarget(null);
            resetResetForm();
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-md">
          <form onSubmit={handleResetSubmit(resetPassword as any)}>
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
              <Controller
                control={resetControl}
                name="password"
                render={({ field, fieldState }) => (
                  <div className="space-y-2">
                    <Label>{t('newPassword')}</Label>
                    <Input type="password" {...field} autoComplete="new-password" />
                    {fieldState.error?.message && (
                      <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
                    )}
                  </div>
                )}
              />
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
