'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { ApiError, getTenant as fetchTenant, updateTenant } from '@/service';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Palette } from 'lucide-react';
import { TenantForm } from '@/components/admin/tenant-form';
import { DEFAULT_TOKENS } from '@/lib/tenant-presets';
import type { TenantFormInput } from '@/lib/validations/tenant';

function toPayload(data: TenantFormInput) {
  return {
    name: data.name,
    slug: data.slug,
    domain: data.domain || null,
    plan: data.plan,
    isActive: data.isActive,
    defaultLocale: data.defaultLocale,
    description: data.description || null,
    address: data.address || null,
    phone: data.phone || null,
    ...data.theme,
  };
}

export default function EditTenantPage() {
  const { id: tenantId } = useParams();
  const t = useTranslations('admin');
  const router = useRouter();
  const [initialValues, setInitialValues] = useState<TenantFormInput | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  async function getTenant() {
    if (!tenantId) return;
    setIsLoading(true);
    try {
      const d = await fetchTenant(Array.isArray(tenantId) ? tenantId[0] : (tenantId as string));
      setInitialValues({
        name: d.name,
        slug: d.slug ?? '',
        domain: d.domain ?? null,
        plan: (d.plan as 'FREE' | 'STARTER' | 'PRO') ?? 'FREE',
        isActive: d.isActive ?? true,
        defaultLocale: (d.defaultLocale as 'en' | 'ar') ?? 'en',
        description: d.description ?? '',
        address: d.address ?? '',
        phone: d.phone ?? '',
        theme: {
          primaryColor: d.primaryColor ?? DEFAULT_TOKENS.primaryColor,
          secondaryColor: d.secondaryColor ?? DEFAULT_TOKENS.secondaryColor,
          accentColor: d.accentColor ?? DEFAULT_TOKENS.accentColor,
          backgroundColor: d.backgroundColor ?? DEFAULT_TOKENS.backgroundColor,
          surfaceColor: d.surfaceColor ?? DEFAULT_TOKENS.surfaceColor,
          textColor: d.textColor ?? DEFAULT_TOKENS.textColor,
          textMuted: d.textMuted ?? DEFAULT_TOKENS.textMuted,
          headingFont: d.headingFont ?? DEFAULT_TOKENS.headingFont,
          bodyFont: d.bodyFont ?? DEFAULT_TOKENS.bodyFont,
          borderRadiusSm: d.borderRadiusSm ?? DEFAULT_TOKENS.borderRadiusSm,
          borderRadiusMd: d.borderRadiusMd ?? DEFAULT_TOKENS.borderRadiusMd,
          borderRadiusLg: d.borderRadiusLg ?? DEFAULT_TOKENS.borderRadiusLg,
          shadow: d.shadow ?? DEFAULT_TOKENS.shadow,
        },
      });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getTenant();
  }, [tenantId]);

  async function onSubmit(data: TenantFormInput) {
    if (!tenantId) return;
    setServerError(null);
    try {
      await updateTenant(Array.isArray(tenantId) ? tenantId[0] : (tenantId as string), toPayload(data));
      toast.add({ type: 'success', description: t('editSuccess', { name: data.name }) });
      router.push('/super/tenants');
    } catch (err) {
      const msg = err instanceof ApiError ? err.message : undefined;
      setServerError(typeof msg === 'string' ? msg : t('editError', { name: data.name }));
    }
  }

  if (isLoading) return <p>{t('loading')}</p>;
  if (!initialValues) return <p>Not Found</p>;

  return (
    <>
      <div className="flex items-center justify-between mb-6 gap-3">
        <h1 className="text-lg font-semibold">
          {t('edit')} {t('tenant')}
        </h1>
        <Button variant="outline" onClick={() => router.push(`/super/themes/${tenantId}`)}>
          <Palette />
          {t('customizeTheme')}
        </Button>
      </div>
      <TenantForm initialValues={initialValues} serverError={serverError} onSubmit={onSubmit} />
    </>
  );
}
