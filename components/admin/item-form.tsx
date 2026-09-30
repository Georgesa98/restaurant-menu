'use client';

import { useState } from 'react';
import { Controller, useFieldArray, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Plus, Trash2, Upload, X } from 'lucide-react';
import { api } from '@/lib/api';
import { itemSchema, type ItemFormInput } from '@/lib/validations/item';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import type { CategoryOption } from '../../types/item.types';

const LOCALES = ['en', 'ar'];

function defaultValues(): ItemFormInput {
  return {
    categoryId: '',
    name: '',
    description: '',
    basePrice: null,
    imageUrl: null,
    isAvailable: true,
    displayOrder: 0,
    isFeatured: false,
    featuredUntil: null,
    variants: [],
    translations: Object.fromEntries(LOCALES.map((l) => [l, { name: '', description: '' }])),
  };
}

export function ItemForm({
  initialValues,
  categories,
  onSubmit,
}: {
  initialValues?: ItemFormInput;
  categories: CategoryOption[];
  onSubmit: (data: ItemFormInput) => void | Promise<void>;
}) {
  const t = useTranslations('admin');
  const router = useRouter();
  const [uploading, setUploading] = useState(false);

  const {
    handleSubmit,
    control,
    setValue,
    formState: { isSubmitting },
  } = useForm<ItemFormInput>({
    // preprocess() makes schema input type diverge from output; form holds output shape.
    resolver: zodResolver(itemSchema) as any,
    defaultValues: initialValues ?? defaultValues(),
  });

  const { fields, append, remove } = useFieldArray({ control: control as any, name: 'variants' });
  const variants = (useWatch({ control: control as any, name: 'variants' }) ?? []) as ItemFormInput['variants'];
  const hasVariants = variants.length > 0;

  async function uploadImage(file: File, onChange: (url: string) => void) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      onChange(res.data.url);
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit as any)}>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Controller
          control={control}
          name="categoryId"
          render={({ field, fieldState }) => {
            const selected = categories.find((c) => c.id === field.value);
            return (
              <Field>
                <FieldLabel>{t('categories')}</FieldLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    {selected ? (
                      <span className="flex flex-1 text-left line-clamp-1">{selected.name}</span>
                    ) : (
                      <SelectValue placeholder="—" />
                    )}
                  </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
                {fieldState.error?.message && <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>}
              </Field>
            );
          }}
        />
        <Controller
          control={control}
          name="displayOrder"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('displayOrder')}</FieldLabel>
              <Input
                type="number"
                value={field.value ?? 0}
                onChange={(e) => field.onChange(e.target.value)}
                dir="ltr"
              />
              {fieldState.error?.message && <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>}
            </Field>
          )}
        />
      </div>

      <div className="mt-3 space-y-3">
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
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('description')}</FieldLabel>
              <Input {...field} value={field.value ?? ''} dir="auto" />
              {fieldState.error?.message && <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>}
            </Field>
          )}
        />
      </div>

      {!hasVariants ? (
        <div className="mt-3">
          <Controller
            control={control}
            name="basePrice"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t('basePriceSyp')}</FieldLabel>
                <Input
                  type="number"
                  step="any"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value === '' ? null : e.target.value)}
                  dir="ltr"
                />
                {fieldState.error?.message && <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>}
              </Field>
            )}
          />
        </div>
      ) : null}

      <div className="border rounded-lg p-4 space-y-3 bg-muted/20 mt-4">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground tracking-wide">{t('variants')}</Label>
          <Button
            type="button"
            variant="outline"
            size="xs"
            onClick={() => append({ label: '', labelEn: '', price: 0 })}
          >
            <Plus className="size-3" /> {t('addVariant')}
          </Button>
        </div>
        {fields.map((f, i) => (
          <div key={f.id} className="flex items-center gap-2">
            <Controller
              control={control}
              name={`variants.${i}.label`}
              render={({ field, fieldState }) => (
                <div className="w-24">
                  <Input {...field} placeholder={t('variantLabelAr')} dir="auto" aria-invalid={fieldState.invalid} />
                </div>
              )}
            />
            <Controller
              control={control}
              name={`variants.${i}.labelEn`}
              render={({ field }) => (
                <Input
                  {...field}
                  value={field.value ?? ''}
                  placeholder={t('variantLabelEn')}
                  className="w-24"
                  dir="auto"
                />
              )}
            />
            <Controller
              control={control}
              name={`variants.${i}.price`}
              render={({ field }) => (
                <Input
                  type="number"
                  step="any"
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={t('price')}
                  className="w-28"
                  dir="ltr"
                />
              )}
            />
            <Button type="button" variant="ghost" size="xs" onClick={() => remove(i)}>
              <Trash2 className="size-3.5 text-destructive" />
            </Button>
          </div>
        ))}
        {fields.length === 0 && <p className="text-xs text-muted-foreground">{t('variantsHint')}</p>}
      </div>

      <div className="mt-4 space-y-2">
        <Controller
          control={control}
          name="imageUrl"
          render={({ field }) => (
            <Field>
              <FieldLabel>{t('image')}</FieldLabel>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => document.getElementById('item-image-upload')?.click()}
                >
                  <Upload className="size-3.5" />
                  {uploading ? t('uploading') : t('upload')}
                </Button>
                <input
                  id="item-image-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (file) await uploadImage(file, field.onChange);
                    e.target.value = '';
                  }}
                />
              </div>
              {field.value ? (
                <div className="relative mt-2 inline-block">
                  <img
                    src={field.value}
                    alt={t('image')}
                    className="w-32 h-24 rounded-lg object-cover ring-1 ring-foreground/10"
                  />
                  <button
                    type="button"
                    onClick={() => setValue('imageUrl', null)}
                    className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-background ring-1 ring-foreground/10 flex items-center justify-center hover:bg-muted"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ) : null}
            </Field>
          )}
        />
      </div>

      <div className="mt-3">
        <Controller
          control={control}
          name="isAvailable"
          render={({ field }) => (
            <Field orientation="horizontal">
              <FieldLabel className="flex-none!">{t('isAvailable')}</FieldLabel>
              <div>
                <Checkbox name={field.name} checked={field.value} onCheckedChange={field.onChange} />
              </div>
            </Field>
          )}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-2">
        <Controller
          control={control}
          name="isFeatured"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm">
              <Checkbox name={field.name} checked={field.value} onCheckedChange={field.onChange} />
              {t('isFeatured')}
            </label>
          )}
        />
        <Controller
          control={control}
          name="featuredUntil"
          render={({ field }) => (
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {t('featuredUntil')}
              <Input
                type="date"
                value={field.value ? String(field.value).slice(0, 10) : ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                className="w-auto"
              />
            </label>
          )}
        />
      </div>

      <Separator className="my-5 h-[1]" />

      <div className="pt-1">
        <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">{t('translations')}</p>
        <div className="space-y-4">
          {LOCALES.map((l) => (
            <div key={l}>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                {l}
              </span>
              <div className="space-y-2 mt-1">
                <Controller
                  control={control}
                  name={`translations.${l}.name`}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={`${t('name')} (${l})`}
                        dir="auto"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-xs text-destructive">{t(fieldState.error.message ?? 'invalid')}</p>
                      )}
                    </>
                  )}
                />
                <Controller
                  control={control}
                  name={`translations.${l}.description`}
                  render={({ field, fieldState }) => (
                    <>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={`${t('description')} (${l})`}
                        dir="auto"
                        aria-invalid={fieldState.invalid}
                      />
                      {fieldState.error && (
                        <p className="text-xs text-destructive">{t(fieldState.error.message ?? 'invalid')}</p>
                      )}
                    </>
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/admin/items')}>
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
