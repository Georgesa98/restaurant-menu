'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  displayOrder: number;
  isActive: boolean;
  translations: { locale: string; name: string; description: string | null }[];
};

const LOCALES = ['en', 'ar'];

function SortableCard({
  cat,
  onEdit,
  onRemove,
}: {
  cat: Category;
  onEdit: (c: Category) => void;
  onRemove: (id: string) => void;
}) {
  const t = useTranslations('admin');
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: cat.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-card rounded-xl ring-1 ring-foreground/5 py-4 px-4 hover:ring-foreground/10 transition-shadow group"
    >
      <div className="flex items-center gap-2 mb-2">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing touch-none"
          aria-label="Drag to reorder"
        >
          <GripVertical className="size-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
        </button>
        <span className="size-2 rounded-full bg-primary/60 shrink-0" />
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">/{cat.slug}</span>
      </div>
      <p className="text-sm font-medium mb-1">{cat.name}</p>
      {cat.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{cat.description}</p>}
      <div className="flex items-center gap-1 mt-auto pt-1">
        <Button variant="ghost" size="xs" onClick={() => onEdit(cat)}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="xs" onClick={() => onRemove(cat.id)}>
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

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const res = await api.get('/api/categories', { params: { tenantId } });
    setCats(res.data);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cats.findIndex((c) => c.id === active.id);
    const newIndex = cats.findIndex((c) => c.id === over.id);

    const reordered = [...cats];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((c, i) => ({ ...c, displayOrder: i }));
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

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">{t('categories')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{cats.length} total</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addCategory')}
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={cats.map((c) => c.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {cats.map((cat) => (
              <SortableCard key={cat.id} cat={cat} onEdit={openEdit} onRemove={remove} />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('categories')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('name')}</Label>
                  <Input name="name" defaultValue={editing?.name} required />
                </div>
                <div className="space-y-2">
                  <Label>{t('slug')}</Label>
                  <Input name="slug" defaultValue={editing?.slug} required />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input name="description" defaultValue={editing?.description ?? ''} />
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
                <p className="text-xs font-medium text-muted-foreground mb-3 tracking-wide">TRANSLATIONS</p>
                <div className="space-y-4">
                  {LOCALES.map((l) => (
                    <div key={l} className="space-y-2 pl-3 border-l-2 border-primary/20">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                        {l}
                      </span>
                      <div className="space-y-2">
                        <Input
                          name={`tr_name_${l}`}
                          defaultValue={editing?.translations?.find((tr) => tr.locale === l)?.name ?? ''}
                          placeholder={`${t('name')} (${l})`}
                        />
                        <Input
                          name={`tr_description_${l}`}
                          defaultValue={editing?.translations?.find((tr) => tr.locale === l)?.description ?? ''}
                          placeholder={`${t('description')} (${l})`}
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
