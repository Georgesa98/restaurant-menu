'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { tenantSchema, type TenantFormInput } from '@/lib/validations/tenant';
import { DEFAULT_TOKENS } from '@/lib/tenant-presets';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function defaultValues(): TenantFormInput {
  return {
    name: '',
    slug: '',
    domain: null,
    plan: 'FREE',
    isActive: true,
    defaultLocale: 'en',
    description: '',
    address: '',
    phone: '',
    theme: { ...DEFAULT_TOKENS },
  };
}

export function TenantForm({
  initialValues,
  serverError,
  onSubmit,
}: {
  initialValues?: TenantFormInput;
  serverError?: string | null;
  onSubmit: (data: TenantFormInput) => void | Promise<void>;
}) {
  const t = useTranslations('admin');
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<TenantFormInput>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: initialValues ?? defaultValues(),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      {serverError && (
        <div
          role="alert"
          className="rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-destructive mb-4"
        >
          {serverError}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          control={control}
          name="name"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('name')}</FieldLabel>
              <Input {...field} dir="auto" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message, { name: t('name') })}</p>
              )}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="slug"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('slug')}</FieldLabel>
              <Input {...field} dir="ltr" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message, { name: t('slug') })}</p>
              )}
            </Field>
          )}
        />
      </div>

      <div className="mt-3">
        <Controller
          control={control}
          name="domain"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('domain')}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                placeholder="e.g. luigispizzeria.com"
                dir="ltr"
              />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
              )}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div className="space-y-2">
          <Label>{t('plan')}</Label>
          <Controller
            control={control}
            name="plan"
            render={({ field }) => (
              <select
                name={field.name}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="FREE">Free</option>
                <option value="STARTER">Starter</option>
                <option value="PRO">Pro</option>
              </select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('defaultLocale')}</Label>
          <Controller
            control={control}
            name="defaultLocale"
            render={({ field }) => (
              <select
                name={field.name}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="en">English</option>
                <option value="ar">Arabic</option>
              </select>
            )}
          />
        </div>
      </div>

      <div className="mt-3">
        <Controller
          control={control}
          name="isActive"
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel className="flex-none!">{t('active')}</FieldLabel>
              <div>
                <Checkbox name={field.name} checked={field.value} onCheckedChange={field.onChange} />
              </div>
            </Field>
          )}
        />
      </div>

      <div className="mt-3">
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('description')}</FieldLabel>
              <Input {...field} value={field.value ?? ''} dir="auto" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
              )}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <Controller
          control={control}
          name="address"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('address')}</FieldLabel>
              <Input {...field} value={field.value ?? ''} dir="auto" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
              )}
            </Field>
          )}
        />
        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('phone')}</FieldLabel>
              <Input {...field} value={field.value ?? ''} dir="ltr" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
              )}
            </Field>
          )}
        />
      </div>

      <div className="flex justify-end pt-4 gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/super/tenants')}>
          <ArrowLeft />
          {t('back')}
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {t('save')}
        </Button>
      </div>
    </form>
  );
}
