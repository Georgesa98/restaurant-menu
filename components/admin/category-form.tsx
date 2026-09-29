'use client';
import { Input } from '@/components/ui/input';
import { useTranslations } from 'next-intl';
import { Controller, useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Checkbox } from '@/components/ui/checkbox';
import { zodResolver } from '@hookform/resolvers/zod';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { categorySchema, type CategoryFormInput } from '@/lib/validations/category';

const LOCALES = ['en', 'ar'];

export function CategoryForm({
  initialValues,
  onSubmit,
}: {
  initialValues?: CategoryFormInput | any;
  onSubmit: (data: CategoryFormInput) => void;
}) {
  const t = useTranslations('admin');
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting, errors },
  } = useForm<CategoryFormInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: initialValues ?? {
      name: '',
      slug: '',
      description: '',
      isActive: true,
      translations: Object.fromEntries(LOCALES.map((l) => [l, { name: '', description: '' }])),
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="flex gap-3 space-y-2">
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

      <div className="space-y-2">
        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('description')}</FieldLabel>
              <Input {...field} dir="auto" />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message, { name: t('description') })}</p>
              )}
            </Field>
          )}
        />
      </div>
      <div className="my-2">
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

      <Separator className="my-5 h-[1]" />

      <div className="pt-4">
        <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">{t('translations')}</p>
        <div className="space-y-4">
          {LOCALES.map((l) => (
            <div key={l}>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                {l}
              </span>
              <div className="space-y-2">
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
        <Button variant="outline" onClick={() => router.push('/admin/categories')}>
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
