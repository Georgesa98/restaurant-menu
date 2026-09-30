'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-provider';

export function RequireRole({
  allow,
  fallback,
  children,
}: {
  allow: string[];
  fallback: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const router = useRouter();
  const ok = !!user && allow.includes(user.role);

  useEffect(() => {
    if (!ok) router.replace(fallback);
  }, [ok, fallback, router]);

  if (!ok) return null;
  return <>{children}</>;
}
