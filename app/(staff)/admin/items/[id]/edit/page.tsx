'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useParams, useRouter } from 'next/navigation';
import { getAllCategories, getItem as fetchItem, updateItem, upsertItemTranslation } from '@/service';
import { useAuth } from '@/components/admin/auth-provider';
import { toast } from '@/components/ui/toast';
import { ItemForm } from '@/components/admin/item-form';
import type { CategoryOption, Item } from '@/types/item.types';
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

export default function EditItemPage() {
  const { id: itemId } = useParams();
  const t = useTranslations('admin');
  const router = useRouter();
  const { user } = useAuth();
  const [item, setItem] = useState<Item | null>(null);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [catsLoading, setCatsLoading] = useState(true);

  async function getItem() {
    if (!itemId) return;
    setIsLoading(true);
    try {
      setItem(await fetchItem(Array.isArray(itemId) ? itemId[0] : (itemId as string)));
    } finally {
      setIsLoading(false);
    }
  }

  async function getCategories() {
    const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;
    try {
      setCategories(await getAllCategories(tenantId));
    } finally {
      setCatsLoading(false);
    }
  }

  useEffect(() => {
    getItem();
  }, [itemId]);

  useEffect(() => {
    if (user) getCategories();
  }, [user]);

  async function onSubmit(data: ItemFormInput) {
    if (!user || !item) return;
    try {
      const updated = await updateItem(item.id, toPayload(data));
      const savedId = updated.id;
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
      toast.add({ type: 'success', description: t('editSuccess', { name: data.name }) });
      router.push('/admin/items');
    } catch {
      toast.add({ type: 'error', description: t('editError', { name: data.name }) });
    }
  }

  if (isLoading || catsLoading) return <p>{t('loading')}</p>;
  if (!item) return <p>Not Found</p>;

  const initialValues: ItemFormInput = {
    categoryId: item.categoryId,
    name: item.name,
    description: item.description ?? '',
    basePrice: item.basePrice ?? null,
    imageUrl: item.imageUrl ?? null,
    isAvailable: item.isAvailable,
    displayOrder: item.displayOrder ?? 0,
    isFeatured: item.isFeatured,
    featuredUntil: item.featuredUntil ?? null,
    variants: (item.variants ?? []).map((v) => ({
      label: v.label,
      labelEn: v.labelEn ?? '',
      price: Number(v.price) || 0,
    })),
    translations: Object.fromEntries(
      LOCALES.map((l) => {
        const tr = item.translations.find((x) => x.locale === l);
        return [l, { name: tr?.name ?? '', description: tr?.description ?? '' }];
      }),
    ),
  };

  return (
    <>
      <h1 className="text-lg font-semibold mb-6">
        {t('edit')} {t('items')}
      </h1>
      <ItemForm initialValues={initialValues} categories={categories} onSubmit={onSubmit} />
    </>
  );
}
