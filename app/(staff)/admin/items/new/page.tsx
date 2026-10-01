'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { createItem, getAllCategories, upsertItemTranslation } from '@/service';
import { useAuth } from '@/components/admin/auth-provider';
import { toast } from '@/components/ui/toast';
import { ItemForm } from '@/components/admin/item-form';
import type { CategoryOption } from '@/types/item.types';
import type { ItemFormInput } from '@/lib/validations/item';

const LOCALES = ['en', 'ar'];

function toPayload(data: ItemFormInput) {
  return {
    categoryId: data.categoryId,
    name: data.name,
    description: data.description || null,
    basePrice: data.variants.length ? null : (data.basePrice ?? null),
    imageUrl: data.imageUrl || null,
    isAvailable: data.isAvailable,
    displayOrder: Number(data.displayOrder) || 0,
    isFeatured: data.isFeatured,
    featuredUntil: data.featuredUntil || null,
    variants: data.variants.filter((v) => v.label.trim()),
  };
}

export default function NewItemPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const { user } = useAuth();
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [catsLoading, setCatsLoading] = useState(true);

  async function getCategories() {
    const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;
    try {
      setCategories(await getAllCategories(tenantId));
    } finally {
      setCatsLoading(false);
    }
  }

  useEffect(() => {
    if (user) getCategories();
  }, [user]);

  async function onSubmit(data: ItemFormInput) {
    if (!user) return;
    try {
      const saved = await createItem({ ...toPayload(data), tenantId: user.tenantId });
      const savedId = saved.id;
      for (const locale of LOCALES) {
        const trName = data.translations[locale]?.name;
        const trDesc = data.translations[locale]?.description;
        if (trName) {
          await upsertItemTranslation(savedId, locale, {
            name: trName,
            description: trDesc || null,
          });
        }
      }
      toast.add({ type: 'success', description: t('createSuccess', { name: data.name }) });
      router.push('/admin/items');
    } catch {
      toast.add({ type: 'error', description: t('createError', { name: data.name }) });
    }
  }

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('create')} {t('items')}
      </h1>
      {catsLoading ? <p>{t('loading')}</p> : <ItemForm categories={categories} onSubmit={onSubmit} />}
    </>
  );
}
