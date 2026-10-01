'use client';
import { useTranslations } from 'next-intl';
import { createCategory, upsertCategoryTranslation } from '@/service';
import { useAuth } from '@/components/admin/auth-provider';
import { toast } from '@/components/ui/toast';
import { CategoryForm } from '@/components/admin/category-form';
import { type CategoryFormInput } from '@/lib/validations/category';

const LOCALES = ['en', 'ar'];

export default function NewCategoryPage() {
  const t = useTranslations('admin');
  const { user } = useAuth();

  async function onSubmit(data: CategoryFormInput) {
    if (!user) return;
    try {
      const created = await createCategory({ ...data, tenantId: user.tenantId });
      for (const locale of LOCALES) {
        const trName = data.translations[locale].name;
        const trDesc = data.translations[locale].description;
        if (trName) {
          await upsertCategoryTranslation(created.id, locale, {
            name: trName,
            description: trDesc || null,
          });
        }
      }
      toast.add({ type: 'success', description: t('createSuccess', { name: 'A new category' }) });
    } catch (error) {
      toast.add({ type: 'error', description: t('createError', { name: 'a new category' }) });
    }
  }
  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('create')} {t('categories')}
      </h1>
      <CategoryForm onSubmit={onSubmit} />
    </>
  );
}
