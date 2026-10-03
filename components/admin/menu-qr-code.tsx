'use client';

import { useRef } from 'react';
import { useTranslations } from 'next-intl';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';

export function MenuQrCode({ slug, domain }: { slug: string; domain: string | null }) {
  const t = useTranslations('admin');
  const svgRef = useRef<SVGSVGElement>(null);

  const base = domain
    ? `https://${domain}`
    : (process.env.NEXT_PUBLIC_APP_URL ??
      (typeof window !== 'undefined' ? window.location.origin : ''));
  const url = `${base}/${slug}/menu`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      toast.add({ type: 'success', description: t('qrCopied') });
    } catch {
      toast.add({ type: 'error', description: t('qrCopyFailed') });
    }
  }

  function downloadPng() {
    const svg = svgRef.current;
    if (!svg) return;
    const xml = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const size = 1024;
      canvas.width = size;
      canvas.height = size;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, size, size);
      ctx.drawImage(img, 0, 0, size, size);
      const a = document.createElement('a');
      a.download = 'menu-qr.png';
      a.href = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(xml)}`;
  }

  return (
    <section className="bg-card rounded-xl ring-1 ring-foreground/5 p-4">
      <p className="text-xs font-medium text-muted-foreground tracking-wide mb-3">
        {t('qrTitle')}
      </p>
      <div className="flex flex-col sm:flex-row items-start gap-4">
        <div className="bg-white rounded-lg p-3 ring-1 ring-foreground/5">
          <QRCodeSVG ref={svgRef} value={url} size={160} />
        </div>
        <div className="space-y-3 min-w-0 flex-1">
          <p className="text-sm break-all select-all">{url}</p>
          <p className="text-xs text-muted-foreground">
            {domain ? t('qrCustomDomain') : t('qrAppDomain')}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" onClick={copyLink}>
              {t('qrCopy')}
            </Button>
            <Button variant="outline" onClick={downloadPng}>
              {t('qrDownload')}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
