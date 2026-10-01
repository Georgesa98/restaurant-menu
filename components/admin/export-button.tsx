'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { exportMenu, getAllTenants } from '@/service';
import { Download } from 'lucide-react';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export function ExportButton({ className }: { className?: string }) {
  const t = useTranslations('admin');
  const [open, setOpen] = useState(false);
  const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
  const [tenantId, setTenantId] = useState('');
  const [loadingTenants, setLoadingTenants] = useState(false);
  const [exporting, setExporting] = useState(false);

  const handleOpenChange = async (next: boolean) => {
    setOpen(next);
    if (next && tenants.length === 0) {
      setLoadingTenants(true);
      try {
        const data = await getAllTenants();
        setTenants(data);
        setTenantId((prev) => prev || data[0]?.id || '');
      } catch (e) {
        console.error('Failed to load tenants', e);
      } finally {
        setLoadingTenants(false);
      }
    }
  };

  const handleExport = async () => {
    if (!tenantId) return;
    setExporting(true);
    try {
      const blob = await exportMenu(tenantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const name = tenants.find((x) => x.id === tenantId)?.name ?? 'menu';
      a.download = `${name}-export.json`;
      a.click();
      URL.revokeObjectURL(url);
      setOpen(false);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed — check console');
    } finally {
      setExporting(false);
    }
  };

  return (
    <>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip={t('export')}
          onClick={() => handleOpenChange(true)}
          className={cn(
            'h-9 rounded-xl px-3 text-[13.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-[18px]',
            className
          )}
        >
          <Download strokeWidth={1.9} />
          <span>{t('export')}</span>
        </SidebarMenuButton>
      </SidebarMenuItem>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('export')}</DialogTitle>
            <DialogDescription>{t('exportPickTenant')}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label>{t('tenant')}</Label>
            {loadingTenants ? (
              <p className="text-sm text-muted-foreground">{t('loading')}</p>
            ) : (
              <select
                value={tenantId}
                onChange={(e) => setTenantId(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                {tenants.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              {t('cancel')}
            </Button>
            <Button onClick={handleExport} disabled={!tenantId || exporting || loadingTenants}>
              {exporting ? t('exporting') : t('export')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
