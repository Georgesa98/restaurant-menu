'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/components/admin/auth-provider';
import { AdminLayout, type ExtendedView } from '@/components/admin/admin-layout';
import { TenantsView } from '@/components/admin/tenants-view';
import { UsersView } from '@/components/admin/users-view';
import { ImportView } from '@/components/admin/import-view';

function AdminShell() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuper = user?.role === 'SUPER_ADMIN';
  const [view, setView] = useState<ExtendedView>(isSuper ? 'tenants' : 'import');

  // Items/categories now live at dedicated routes (/admin/items, /admin/categories).
  useEffect(() => {
    if (!isSuper) router.replace('/admin/items');
  }, [isSuper, router]);

  if (!isSuper) return null;

  // Role views are disjoint: super-admins get tenants/users. Guard against a
  // stale view after role switches.
  const effectiveView: ExtendedView =
    view === 'items' || view === 'categories' ? 'tenants' : view;

  return (
    <AdminLayout view={effectiveView} onNavigate={setView}>
      {effectiveView === 'tenants' && <TenantsView />}
      {effectiveView === 'users' && <UsersView />}
      {effectiveView === 'import' && <ImportView />}
    </AdminLayout>
  );
}

export default function AdminPage() {
  return (
    <AuthProvider>
      <AdminShell />
    </AuthProvider>
  );
}
