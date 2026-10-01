'use client';

import { useTranslations } from 'next-intl';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ImportUploader } from './import-uploader';
import type { TenantRow } from './tenants-columns';

export function TenantImportDialog({
  row,
  onClose,
}: {
  row: TenantRow | null;
  onClose: () => void;
}) {
  const t = useTranslations('admin');

  return (
    <Dialog open={row !== null} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {t('import')} · {row?.name}
          </DialogTitle>
        </DialogHeader>
        {row && <ImportUploader key={row.id} tenantId={row.id} />}
      </DialogContent>
    </Dialog>
  );
}
