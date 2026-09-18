'use client';

import { useState } from 'react';
import { AuthProvider, useAuth } from '@/components/admin/auth-provider';
import { AdminLayout, type ExtendedView } from '@/components/admin/admin-layout';
import { CategoriesView } from '@/components/admin/categories-view';
import { ItemsView } from '@/components/admin/items-view';
import { TenantsView } from '@/components/admin/tenants-view';
import { UsersView } from '@/components/admin/users-view';
import { ImportView } from '@/components/admin/import-view';

function AdminShell() {
  const { user } = useAuth();
  const isSuper = user?.role === 'SUPER_ADMIN';
  const [view, setView] = useState<ExtendedView>(isSuper ? 'tenants' : 'items');

  // Role views are disjoint: super-admins get tenants/users, tenant admins
  // get items/categories. Guard against a stale view after role switches.
  const effectiveView: ExtendedView =
    isSuper && (view === 'items' || view === 'categories')
      ? 'tenants'
      : !isSuper && (view === 'tenants' || view === 'users')
        ? 'items'
        : view;

  return (
    <AdminLayout view={effectiveView} onNavigate={setView}>
      {effectiveView === 'categories' && <CategoriesView />}
      {effectiveView === 'items' && <ItemsView />}
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
