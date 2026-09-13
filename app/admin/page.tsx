'use client';

import { useState } from 'react';
import { AuthProvider } from '@/components/admin/auth-provider';
import { AdminLayout, type ExtendedView } from '@/components/admin/admin-layout';
import { CategoriesView } from '@/components/admin/categories-view';
import { ItemsView } from '@/components/admin/items-view';
import { TenantsView } from '@/components/admin/tenants-view';
import { ImportView } from '@/components/admin/import-view';

export default function AdminPage() {
  const [view, setView] = useState<ExtendedView>('items');

  return (
    <AuthProvider>
      <AdminLayout view={view} onNavigate={setView}>
        {view === 'categories' && <CategoriesView />}
        {view === 'items' && <ItemsView />}
        {view === 'tenants' && <TenantsView />}
        {view === 'import' && <ImportView />}
      </AdminLayout>
    </AuthProvider>
  );
}
