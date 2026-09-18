'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DataTable } from './data-table';
import { getCategoryColumns, type CategoryRow } from './categories-columns';

type Category = CategoryRow & {
  isActive: boolean;
  translations: { locale: string; name: string; description: string | null }[];
};

const LOCALES = ['en', 'ar'];

export function CategoriesView() {
  const t = useTranslations('admin');
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/api/categories', { params: { tenantId } });
      setCats(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const base = {
      name: data.get('name') as string,
      slug: data.get('slug') as string,
      description: (data.get('description') as string) || null,
      displayOrder: Number(data.get('displayOrder')),
      isActive: data.get('isActive') === 'on',
    };

    let saved: Category;
    if (editing.id) {
      const res = await api.put(`/api/categories/${editing.id}`, base);
      saved = res.data;
    } else {
      const res = await api.post('/api/categories', { ...base, tenantId: user?.tenantId });
      saved = res.data;
    }

    for (const locale of LOCALES) {
      const trName = data.get(`tr_name_${locale}`) as string;
      const trDesc = data.get(`tr_description_${locale}`) as string;
      if (trName && saved.id) {
        await api.put(`/api/translations/categories/${saved.id}/${locale}`, {
          name: trName,
          description: trDesc || null,
        });
      }
    }

    setOpen(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/api/categories/${id}`);
    load();
  }

  function openEdit(cat?: Category) {
    setEditing(
      cat ?? {
        id: '',
        name: '',
        slug: '',
        description: '',
        displayOrder: 0,
        isActive: true,
        translations: [],
      },
    );
    setOpen(true);
  }

  const columns = useMemo(
    () =>
      getCategoryColumns(t, {
        onEdit: (row) => openEdit(cats.find((c) => c.id === row.id)),
        onRemove: remove,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cats, t],
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('categories')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('categoryCount', { count: cats.length })}</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addCategory')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={cats}
        searchKey="name"
        searchPlaceholder={t('searchCategories')}
        isLoading={loading}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('categories')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[85dvh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('name')}</Label>
                  <Input name="name" defaultValue={editing?.name} required dir="auto" />
                </div>
                <div className="space-y-2">
                  <Label>{t('slug')}</Label>
                  <Input name="slug" defaultValue={editing?.slug} required dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input name="description" defaultValue={editing?.description ?? ''} dir="auto" />
              </div>
              <div className="space-y-2">
                <Label>{t('displayOrder')}</Label>
                <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked={editing?.isActive} />
                {t('isAvailable')}
              </label>

              <div className="border-t pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">{t('translations')}</p>
                <div className="space-y-4">
                  {LOCALES.map((l) => (
                    <div key={l} className="space-y-2 ps-3 border-s-2 border-primary/20">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {l}
                      </span>
                      <div className="space-y-2">
                        <Input
                          name={`tr_name_${l}`}
                          defaultValue={editing?.translations?.find((tr) => tr.locale === l)?.name ?? ''}
                          placeholder={`${t('name')} (${l})`}
                          dir="auto"
                        />
                        <Input
                          name={`tr_description_${l}`}
                          defaultValue={editing?.translations?.find((tr) => tr.locale === l)?.description ?? ''}
                          placeholder={`${t('description')} (${l})`}
                          dir="auto"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
