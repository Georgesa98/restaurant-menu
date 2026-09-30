'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/auth-provider';

export default function AdminIndexPage() {
  const { user } = useAuth();
  const router = useRouter();
  const isSuper = user?.role === 'SUPER_ADMIN';

  useEffect(() => {
    router.replace(isSuper ? '/super/tenants' : '/admin/items');
  }, [isSuper, router]);

  return null;
}
