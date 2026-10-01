import { AppSidebar } from '@/components/admin/app-sidebar';
import { AppSidebarTitle } from '@/components/admin/app-sidebar-title';
import { RequireRole } from '@/components/admin/role-guard';
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar';
import React from 'react';

export default function AdminBranchLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireRole allow={['TENANT_ADMIN']} fallback="/super/tenants">
      <SidebarProvider>
        <AppSidebar />

        <SidebarInset>
          <AppSidebarTitle />
          <main className="mx-auto my-4 w-full max-w-3xl min-w-0 overflow-x-clip has-[.theme-wide]:max-w-6xl has-[.theme-wide]:px-4">{children}</main>
        </SidebarInset>
      </SidebarProvider>
    </RequireRole>
  );
}
