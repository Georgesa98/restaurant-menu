import { AuthProvider } from '@/components/admin/auth-provider';
import { Toaster } from '@/components/ui/toast';
import React from 'react';

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <Toaster />
    </AuthProvider>
  );
}
