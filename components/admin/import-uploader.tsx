'use client';

import { useState, useRef } from 'react';
import { useTranslations } from 'next-intl';
import { ApiError, importMenu } from '@/service';
import { Button } from '@/components/ui/button';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';

type ImportResult = {
  imported: { categories: number; items: number; translations: number };
  errors?: string[];
} | null;

export function ImportUploader({ tenantId }: { tenantId?: string }) {
  const t = useTranslations('admin');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>('');
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (f: File | undefined) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
    const reader = new FileReader();
    reader.onload = () => setPreview((reader.result as string).slice(0, 300));
    reader.readAsText(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true);
    setResult(null);
    setError('');
    try {
      const text = await file.text();
      const json = JSON.parse(text);

      setResult(await importMenu(json, tenantId));
    } catch (e) {
      const msg = e instanceof ApiError ? e.message : undefined;
      setError(typeof msg === 'string' ? msg : t('importFailed'));
    } finally {
      setImporting(false);
    }
  };

  const reset = () => {
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');
  };

  return (
    <div className="space-y-4">
      {error && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-destructive"
        >
          {error}
        </div>
      )}
      {!result && (
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="size-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">{file ? file.name : t('importDropHint')}</p>
          {preview && (
            <pre className="mt-3 text-xs text-left bg-muted p-3 rounded max-h-32 overflow-auto">{preview}...</pre>
          )}
          <input
            ref={inputRef}
            type="file"
            accept=".json"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          {file && (
            <div className="flex gap-2 justify-center mt-4" onClick={(e) => e.stopPropagation()}>
              <Button size="sm" onClick={handleImport} disabled={importing}>
                {importing ? t('importing') : t('import')}
              </Button>
              <Button size="sm" variant="ghost" onClick={reset}>
                {t('cancel')}
              </Button>
            </div>
          )}
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="size-5" />
            <span className="font-medium">{t('importComplete')}</span>
          </div>
          <div className="text-sm space-y-1 text-muted-foreground">
            <p>
              {t('categories')}: {result.imported.categories}
            </p>
            <p>
              {t('items')}: {result.imported.items}
            </p>
            <p>
              {t('translations')}: {result.imported.translations}
            </p>
          </div>
          {result.errors && result.errors.length > 0 && (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-amber-600">
                <AlertCircle className="size-4" />
                <span className="text-sm font-medium">{t('importErrors')}</span>
              </div>
              <ul className="text-xs text-muted-foreground space-y-0.5 ml-6 list-disc">
                {result.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </div>
          )}
          <Button size="sm" variant="outline" onClick={reset}>
            {t('importAnother')}
          </Button>
        </div>
      )}
    </div>
  );
}
