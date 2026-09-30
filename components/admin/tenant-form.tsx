'use client';

import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { tenantSchema, type TenantFormInput, type ThemeTokensInput } from '@/lib/validations/tenant';
import {
  BODY_FONT_OPTIONS,
  DEFAULT_TOKENS,
  HEADING_FONT_OPTIONS,
  RADIUS_OPTIONS,
  SHADOW_OFF,
  SHADOW_ON,
  THEME_PRESETS,
} from '@/lib/tenant-presets';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const COLOR_FIELDS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'textMuted',
] as const;

type ColorField = (typeof COLOR_FIELDS)[number];

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
    setValue,
    formState: { isSubmitting },
  } = useForm<TenantFormInput>({
    resolver: zodResolver(tenantSchema) as any,
    defaultValues: initialValues ?? defaultValues(),
  });

  const theme = (useWatch({ control: control as any, name: 'theme' }) ?? DEFAULT_TOKENS) as ThemeTokensInput;

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

      <div className="border-t pt-4 space-y-4 mt-4">
        <p className="text-xs font-medium text-muted-foreground tracking-wide">{t('appearance')}</p>
        <div className="space-y-2">
          <Label>{t('themePreset')}</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {THEME_PRESETS.map((p) => {
              const active = JSON.stringify(theme) === JSON.stringify(p.tokens);
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setValue('theme', { ...p.tokens })}
                  aria-pressed={active}
                  className={`rounded-lg border p-2 text-left transition-colors ${
                    active ? 'border-primary ring-1 ring-primary' : 'border-input hover:border-primary/50'
                  }`}
                >
                  <span
                    className="flex h-10 items-center justify-center rounded-md"
                    style={{ background: p.tokens.backgroundColor }}
                  >
                    <span className="size-4 rounded-full" style={{ background: p.tokens.primaryColor }} />
                  </span>
                  <span className="mt-1.5 block text-xs font-medium">{t(p.labelKey)}</span>
                </button>
              );
            })}
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {COLOR_FIELDS.map((colorField: ColorField) => (
            <div key={colorField} className="space-y-1.5">
              <Label>{t(colorField)}</Label>
              <Controller
                control={control}
                name={`theme.${colorField}`}
                render={({ field }) => (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="size-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
                      aria-label={t(colorField)}
                    />
                    <span className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                      {field.value}
                    </span>
                  </div>
                )}
              />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>{t('headingFont')}</Label>
            <Controller
              control={control}
              name="theme.headingFont"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {HEADING_FONT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('bodyFont')}</Label>
            <Controller
              control={control}
              name="theme.bodyFont"
              render={({ field }) => (
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {BODY_FONT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label>{t('cornerStyle')}</Label>
            <Controller
              control={control}
              name="theme.borderRadiusLg"
              render={({ field }) => (
                <select
                  value={RADIUS_OPTIONS.find((o) => o.tokens.borderRadiusLg === field.value)?.value ?? ''}
                  onChange={(e) => {
                    const opt = RADIUS_OPTIONS.find((o) => o.value === e.target.value);
                    if (opt)
                      setValue('theme', {
                        ...theme,
                        borderRadiusSm: opt.tokens.borderRadiusSm,
                        borderRadiusMd: opt.tokens.borderRadiusMd,
                        borderRadiusLg: opt.tokens.borderRadiusLg,
                      });
                  }}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {RADIUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              )}
            />
          </div>
        </div>
        <Controller
          control={control}
          name="theme.shadow"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                name={field.name}
                checked={field.value !== SHADOW_OFF}
                onCheckedChange={(v) => field.onChange(v ? SHADOW_ON : SHADOW_OFF)}
              />
              {t('cardShadow')}
            </label>
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
