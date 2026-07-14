'use client';

import { useEffect, useState, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Upload, X } from 'lucide-react';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type Item = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  price: number;
  financialPrice: number;
  imageThumbnail: string | null;
  imageCard: string | null;
  imageFull: string | null;
  isAvailable: boolean;
  displayOrder: number;
  dietaryTags: string[];
  category?: { name: string };
  translations: { locale: string; name: string; description: string | null }[];
};

type Category = { id: string; name: string };

const LOCALES = ['en', 'ar'];

function SortableCard({
  item,
  onEdit,
  onRemove,
  onToggleAvailability,
  t,
}: {
  item: Item;
  onEdit: (i: Item) => void;
  onRemove: (id: string) => void;
  onToggleAvailability: (i: Item) => void;
  t: (key: string) => string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative bg-card rounded-xl ring-1 ring-foreground/5 py-4 px-4 hover:ring-foreground/10 hover:shadow-md transition-all group"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing touch-none"
            aria-label="Drag to reorder"
          >
            <GripVertical className="size-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
          </button>
          <button
            onClick={() => onToggleAvailability(item)}
            className={`size-2 rounded-full shrink-0 transition-colors ${
              item.isAvailable ? 'bg-amber' : 'bg-muted-foreground/30'
            }`}
            title={item.isAvailable ? t('isAvailable') : 'notAvailable'}
          />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.category?.name}</span>
      </div>
      <p className="text-sm font-medium truncate mb-1">{item.name}</p>
      {item.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{item.description}</p>}
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">SYP {Number(item.price).toLocaleString('en-US')}</span>
        <div className="flex gap-1">
          <Button variant="ghost" size="xs" onClick={() => onEdit(item)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onRemove(item.id)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export function ItemsView() {
  const t = useTranslations('admin');
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function load() {
    const [itemRes, catRes] = await Promise.all([
      api.get('/api/items', { params: { tenantId } }),
      api.get('/api/categories', { params: { tenantId } }),
    ]);
    setItems(itemRes.data);
    setCategories(catRes.data);
  }

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory) {
      result = result.filter((item) => item.categoryId === filterCategory);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, filterCategory, search]);

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = filtered.findIndex((i) => i.id === active.id);
    const newIndex = filtered.findIndex((i) => i.id === over.id);

    const reordered = [...filtered];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((i, idx) => ({ ...i, displayOrder: idx }));
    setItems((prev) => {
      const map = new Map(updated.map((i) => [i.id, i]));
      return prev.map((i) => map.get(i.id) ?? i);
    });

    await api.patch('/api/items/reorder', {
      items: updated.map((i) => ({ id: i.id, displayOrder: i.displayOrder })),
    });
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const base = {
      categoryId,
      name: data.get('name') as string,
      description: (data.get('description') as string) || null,
      price: parseFloat(data.get('price') as string),
      financialPrice: parseFloat(data.get('financialPrice') as string) || 0,
      imageThumbnail: (data.get('imageThumbnail') as string) || null,
      imageCard: (data.get('imageCard') as string) || null,
      imageFull: (data.get('imageFull') as string) || null,
      isAvailable: data.get('isAvailable') === 'on',
      displayOrder: Number(data.get('displayOrder')),
      dietaryTags: (data.get('dietaryTags') as string)
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };

    let saved: Item;
    if (editing.id) {
      const res = await api.put(`/api/items/${editing.id}`, base);
      saved = res.data;
    } else {
      const res = await api.post('/api/items', { ...base, tenantId: user?.tenantId });
      saved = res.data;
    }

    for (const locale of LOCALES) {
      const trName = data.get(`tr_name_${locale}`) as string;
      const trDesc = data.get(`tr_description_${locale}`) as string;
      if (trName && saved.id) {
        await api.put(`/api/translations/items/${saved.id}/${locale}`, {
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
    await api.delete(`/api/items/${id}`);
    load();
  }

  async function toggleAvailability(item: Item) {
    await api.patch(`/api/items/${item.id}/availability`, { isAvailable: !item.isAvailable });
    load();
  }

  const [previews, setPreviews] = useState<{ thumbnail: string; card: string; full: string } | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreviews(res.data);
    } finally {
      setUploading(false);
    }
  }

  function openEdit(item?: Item) {
    const defaults = item ?? {
      id: '',
      categoryId: '',
      name: '',
      description: '',
      price: 0,
      financialPrice: 0,
      imageThumbnail: null,
      imageCard: null,
      imageFull: null,
      isAvailable: true,
      displayOrder: 0,
      dietaryTags: [],
      translations: [],
    };
    setPreviews(
      item?.imageCard
        ? { thumbnail: item.imageThumbnail ?? '', card: item.imageCard, full: item.imageFull ?? '' }
        : null,
    );
    setEditing(defaults);
    setCategoryId(defaults.categoryId ?? '');
    setOpen(true);
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('items')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{items.length} total</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addItem')}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder="Search items…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-64"
        />
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterCategory(null)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setFilterCategory(c.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                  filterCategory === c.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={filtered.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onRemove={remove}
                onToggleAvailability={toggleAvailability}
                t={t}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setPreviews(null);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-xl">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('items')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[65vh] overflow-y-auto">
              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>{t('categories')}</Label>
                  <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? '')}>
                    <SelectTrigger>
                      <SelectValue placeholder="—" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Consumer price (SYP)</Label>
                  <Input name="price" type="number" step="0.01" defaultValue={editing?.price} required />
                </div>
                <div className="space-y-2">
                  <Label>Financial price (SYP)</Label>
                  <Input name="financialPrice" type="number" step="0.01" defaultValue={editing?.financialPrice} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input name="name" defaultValue={editing?.name} required />
              </div>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input name="description" defaultValue={editing?.description ?? ''} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('displayOrder')}</Label>
                  <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder} />
                </div>
                <div className="space-y-2">
                  <Label>Image</Label>
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={uploading}
                      onClick={() => document.getElementById('image-upload')?.click()}
                    >
                      <Upload className="size-3.5" />
                      {uploading ? 'Uploading…' : 'Upload'}
                    </Button>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) await uploadFile(file);
                      }}
                    />
                  </div>
                  <input type="hidden" name="imageThumbnail" value={previews?.thumbnail ?? ''} />
                  <input type="hidden" name="imageCard" value={previews?.card ?? ''} />
                  <input type="hidden" name="imageFull" value={previews?.full ?? ''} />
                  {previews?.card && (
                    <div className="relative mt-2 inline-block">
                      <img
                        src={previews.card}
                        alt="Preview"
                        className="w-24 h-16 rounded-lg object-cover ring-1 ring-foreground/10"
                      />
                      <button
                        type="button"
                        onClick={() => setPreviews(null)}
                        className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-background ring-1 ring-foreground/10 flex items-center justify-center hover:bg-muted"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('dietaryTags')}</Label>
                <Input
                  name="dietaryTags"
                  defaultValue={(editing?.dietaryTags ?? []).join(', ')}
                  placeholder="e.g. vegan, gluten-free"
                />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="isAvailable" type="checkbox" defaultChecked={editing?.isAvailable} />
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
