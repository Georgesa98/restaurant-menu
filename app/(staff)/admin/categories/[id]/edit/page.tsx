'use client';
import { useAuth } from '@/components/admin/auth-provider';
import { CategoryForm } from '@/components/admin/category-form';
import { toast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { type CategoryFormInput } from '@/lib/validations/category';
import { Category } from '@prisma/client';
import { useTranslations } from 'next-intl';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

type CategoryWithTranslation = Category & {
  translations: [
    {
      locale: string;
      name: string;
      description: string | null;
    },
  ];
};

const LOCALES = ['en', 'ar'];

export default function EditCategoryPage() {
  const { id: catId } = useParams();
  const [cat, setCat] = useState<CategoryWithTranslation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const t = useTranslations('admin');

  async function getCategory() {
    if (!catId) return;
    setIsLoading(true);
    try {
      const res = await api.get(`/api/categories/${catId}`);
      setCat(res.data);
    } finally {
      setIsLoading(false);
    }
  }
  useEffect(() => {
    getCategory();
  }, [catId]);

  console.log(cat);

  async function onSubmit(data: CategoryFormInput) {
    console.log('ENTER');

    if (!user || !cat) return;
    console.log('OUT');
    try {
      const res = await api.put(`/api/categories/${cat.id}`, { ...data });
      for (const locale of LOCALES) {
        const trName = data.translations[locale].name;
        const trDesc = data.translations[locale].description;
        if (trName) {
          await api.put(`/api/translations/categories/${res.data.id}/${locale}`, {
            name: trName,
            description: trDesc || null,
          });
        }
      }
      toast.add({ type: 'success', description: t('editSuccess', { name: 'Category' }) });
    } catch (error) {
      toast.add({ type: 'error', description: t('editError', { name: 'Category' }) });
    }
  }

  if (isLoading) return;
  if (!cat) return <p>Not Found</p>;

  const initialValues = {
    name: cat.name,
    slug: cat.slug,
    description: cat.description ?? '',
    isActive: cat.isActive,
    translations: Object.fromEntries(cat.translations.map(({ locale, ...rest }) => [locale, rest])),
  };

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('edit')} {t('categories')}
      </h1>
      <CategoryForm initialValues={initialValues} onSubmit={onSubmit} />
    </>
  );
}
