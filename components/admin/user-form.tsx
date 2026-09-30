'use client';

import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createUserSchema, editUserSchema, type CreateUserInput, type EditUserInput } from '@/lib/validations/user';
import { Button } from '@/components/ui/button';
import { Field, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export type TenantOption = { id: string; name: string };

function createDefaults(): CreateUserInput {
  return {
    name: '',
    username: null,
    email: '',
    password: '',
    role: 'TENANT_ADMIN',
    tenantId: null,
  };
}

function editDefaults(): EditUserInput {
  return {
    name: '',
    username: null,
    role: 'TENANT_ADMIN',
    tenantId: null,
  };
}

type CreateProps = {
  initialValues?: CreateUserInput;
  tenants: TenantOption[];
  isCreate: true;
  serverError?: string | null;
  onSubmit: (data: CreateUserInput) => void | Promise<void>;
};

type EditProps = {
  initialValues?: EditUserInput;
  tenants: TenantOption[];
  isCreate: false;
  serverError?: string | null;
  onSubmit: (data: EditUserInput) => void | Promise<void>;
};

export function UserForm(props: CreateProps | EditProps) {
  const { initialValues, tenants, isCreate, serverError, onSubmit } = props;
  const t = useTranslations('admin');
  const router = useRouter();

  const {
    handleSubmit,
    control,
    formState: { isSubmitting },
  } = useForm<CreateUserInput>({
    // preprocess() makes schema input type diverge from output; form holds output shape.
    resolver: zodResolver(isCreate ? createUserSchema : editUserSchema) as any,
    defaultValues: (initialValues ?? (isCreate ? createDefaults() : editDefaults())) as CreateUserInput,
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
          name="username"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel>{t('username')}</FieldLabel>
              <Input
                {...field}
                value={field.value ?? ''}
                onChange={(e) => field.onChange(e.target.value || null)}
                dir="ltr"
              />
              {fieldState.error?.message && (
                <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
              )}
            </Field>
          )}
        />
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
      </div>

      {isCreate && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t('email')}</FieldLabel>
                <Input
                  {...field}
                  value={(field.value as string | undefined) ?? ''}
                  type="email"
                  dir="ltr"
                />
                {fieldState.error?.message && (
                  <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
                )}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>{t('password')}</FieldLabel>
                <Input
                  {...field}
                  value={(field.value as string | undefined) ?? ''}
                  type="password"
                  autoComplete="new-password"
                />
                {fieldState.error?.message && (
                  <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
                )}
              </Field>
            )}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
        <div className="space-y-2">
          <Label>{t('role')}</Label>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <select
                name={field.name}
                value={field.value}
                onChange={(e) => field.onChange(e.target.value)}
                className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
              >
                <option value="TENANT_ADMIN">{t('tenantAdmin')}</option>
                <option value="SUPER_ADMIN">{t('superAdmin')}</option>
              </select>
            )}
          />
        </div>
        <div className="space-y-2">
          <Label>{t('tenant')}</Label>
          <Controller
            control={control}
            name="tenantId"
            render={({ field, fieldState }) => (
              <>
                <select
                  name={field.name}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.value || null)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  <option value="">{t('noTenant')}</option>
                  {tenants.map((x) => (
                    <option key={x.id} value={x.id}>
                      {x.name}
                    </option>
                  ))}
                </select>
                {fieldState.error?.message && (
                  <p className="text-xs text-destructive">{t(fieldState.error.message)}</p>
                )}
              </>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end pt-4 gap-2">
        <Button type="button" variant="outline" onClick={() => router.push('/super/users')}>
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
