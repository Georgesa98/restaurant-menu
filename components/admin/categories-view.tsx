'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, ImageOff } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  coverImage: string | null;
  translations: { locale: string; name: string; description: string | null }[];
};

const LOCALES = ['en', 'ar'];

function SortableCategoryRow({
  cat,
  dragDisabled,
  onEdit,
  onRemove,
  t,
}: {
  cat: Category;
  dragDisabled: boolean;
  onEdit: (c: Category) => void;
  onRemove: (id: string) => void;
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: cat.id,
    disabled: dragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 bg-card rounded-xl ring-1 ring-foreground/5 py-3 px-4 hover:ring-foreground/10 hover:shadow-md transition-all"
    >
      <button
        {...attributes}
        {...listeners}
        disabled={dragDisabled}
        className="cursor-grab active:cursor-grabbing touch-none disabled:cursor-default disabled:opacity-30 shrink-0"
        aria-label={t('dragToReorder')}
        title={dragDisabled ? undefined : t('dragToReorder')}
      >
        <GripVertical className="size-4 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
      </button>
      {cat.coverImage ? (
        <img
          src={cat.coverImage}
          alt=""
          loading="lazy"
          className="size-14 rounded-lg object-cover shrink-0 ring-1 ring-foreground/10"
        />
      ) : (
        <div
          className="size-14 rounded-lg bg-muted flex items-center justify-center shrink-0 ring-1 ring-amber/40"
          title={t('noPhoto')}
        >
          <ImageOff className="size-5 text-muted-foreground/50" />
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium truncate">{cat.name}</p>
        <p className="mt-0.5">
          <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded whitespace-nowrap">
            /{cat.slug}
          </span>
        </p>
        {cat.description && (
          <p className="text-xs text-muted-foreground truncate mt-1">{cat.description}</p>
        )}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="xs" onClick={() => onEdit(cat)} aria-label={t('edit')}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => onRemove(cat.id)} aria-label={t('delete')}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}

export function CategoriesView() {
  const t = useTranslations('admin');
  const { user } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Category | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/api/categories', { params: { tenantId } });
      setCats(
        (res.data as (Omit<Category, 'coverImage'> & { items?: { imageUrl: string | null }[] })[]).map(
          (c) => ({ ...c, coverImage: c.items?.[0]?.imageUrl ?? null }),
        ),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Search is view-only: drag-reorder always operates on the full ordered
  // array, so displayOrder stays globally consistent. Grips disable while
  // a filter is active (reordering a visible subset would corrupt order).
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter(
      (c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [cats, search]);
  const filtering = search.trim() !== '';

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cats.findIndex((c) => c.id === active.id);
    const newIndex = cats.findIndex((c) => c.id === over.id);
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = [...cats];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((c, idx) => ({ ...c, displayOrder: idx }));
    setCats(updated);

    await api.patch('/api/categories/reorder', {
      items: updated.map((c) => ({ id: c.id, displayOrder: c.displayOrder })),
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const base = {
      name: data.get('name') as string,
      slug: data.get('slug') as string,
      description: (data.get('description') as string) || null,
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
        coverImage: null,
        translations: [],
      },
    );
    setOpen(true);
  }

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

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder={t('searchCategories')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-64"
        />
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground py-8 text-center">{t('loading')}</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground py-8 text-center">{t('noResults')}</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={filtered.map((c) => c.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {filtered.map((cat) => (
                <SortableCategoryRow
                  key={cat.id}
                  cat={cat}
                  dragDisabled={filtering}
                  onEdit={openEdit}
                  onRemove={remove}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

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
