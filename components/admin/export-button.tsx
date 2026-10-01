'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { exportMenu } from '@/service';
import { Download } from 'lucide-react';
import { useAuth } from './auth-provider';
import { SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

export function ExportButton({ className }: { className?: string }) {
  const t = useTranslations('admin');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleExport = async () => {
    setLoading(true);
    try {
      let tenantId: string | undefined;
      if (user?.role === 'SUPER_ADMIN') {
        const tid = prompt('Tenant ID (leave empty for your own):');
        if (tid) tenantId = tid;
      }

      const blob = await exportMenu(tenantId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'menu-export.json';
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
      alert('Export failed — check console');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        tooltip={t('export')}
        onClick={handleExport}
        disabled={loading}
        className={cn(
          'h-9 rounded-xl px-3 text-[13.5px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground [&_svg]:size-[18px]',
          className
        )}
      >
        <Download strokeWidth={1.9} />
        <span>{loading ? t('exporting') : t('export')}</span>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );
}
