'use client';

import { useTranslations } from 'next-intl';
import { ImportUploader } from '@/components/admin/import-uploader';

export default function AdminImportPage() {
  const t = useTranslations('admin');

  return (
    <div className="max-w-5xl">
      <div className="mb-4">
        <h1 className="text-xl font-bold">{t('import')}</h1>
      </div>
      <ImportUploader />
    </div>
  );
}
