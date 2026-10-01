'use client';

import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { ThemeStudio } from '@/components/admin/theme-studio';

export default function SuperThemePage() {
  const t = useTranslations('admin');
  const { id } = useParams<{ id: string }>();

  if (!id) return <p>{t('loading')}</p>;

  return <ThemeStudio tenantId={id} />;
}
