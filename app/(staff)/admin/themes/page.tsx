'use client';

import { useTranslations } from 'next-intl';
import { useAuth } from '@/components/admin/auth-provider';
import { ThemeStudio } from '@/components/admin/theme-studio';

export default function AdminThemesPage() {
  const t = useTranslations('admin');
  const { user } = useAuth();

  if (!user) return <p>{t('loading')}</p>;
  if (!user.tenantId) return <p className="text-sm text-muted-foreground">{t('noTenant')}</p>;

  return <ThemeStudio tenantId={user.tenantId} />;
}
