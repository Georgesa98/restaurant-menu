'use client';

import { useEffect, useState, useMemo } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useAuth } from './auth-provider';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Upload, X, ImageOff, Pin } from 'lucide-react';
import { PagerControls } from './data-table';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, useSortable, rectSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

type VariantRow = {
  id?: string;
  label: string;
  labelEn: string;
  price: number;
};

type Item = {
  id: string;
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  category?: { name: string };
  translations: { locale: string; name: string; description: string | null }[];
  variants: VariantRow[];
};

type Category = { id: string; name: string };

const LOCALES = ['en', 'ar'];

function formatSyp(n: number, locale: string, isRange = false): string {
  const num = n.toLocaleString('en-US');
  return locale === 'ar' ? `${num} ل.س${isRange ? '+' : ''}` : `SYP ${num}${isRange ? '+' : ''}`;
}

function SortableCard({
  item,
  onEdit,
  onRemove,
  onToggleAvailability,
  onToggleFeatured,
  t,
  locale,
}: {
  item: Item;
  onEdit: (i: Item) => void;
  onRemove: (id: string) => void;
  onToggleAvailability: (i: Item) => void;
  onToggleFeatured: (i: Item) => void;
  t: (key: string) => string;
  locale: string;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  // SYP-only (locked to match Android). Latin digits always; suffix follows UI locale.
  const priceLabel =
    item.variants.length || item.basePrice
      ? formatSyp(
          item.variants.length
            ? Math.min(...item.variants.map((v) => v.price))
            : Number(item.basePrice),
          locale,
          item.variants.length > 0,
        )
      : null;

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
            aria-label={t('dragToReorder')}
          >
            <GripVertical className="size-3.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors" />
          </button>
          <button
            onClick={() => onToggleAvailability(item)}
            className={`size-2 rounded-full shrink-0 transition-colors ${
              item.isAvailable ? 'bg-amber' : 'bg-muted-foreground/30'
            }`}
            title={item.isAvailable ? t('isAvailable') : t('notAvailable')}
          />
        </div>
        <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">{item.category?.name}</span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
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
          <p className="text-sm font-medium truncate mb-1">{item.name}</p>
          {item.description && <p className="text-xs text-muted-foreground line-clamp-2">{item.description}</p>}
          {!item.imageUrl && (
            <span className="inline-block mt-1 text-[11px] font-medium text-amber bg-amber/10 px-1.5 py-0.5 rounded">
              {t('noPhoto')}
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold tabular-nums">{priceLabel}</span>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="xs"
            onClick={() => onToggleFeatured(item)}
            title={item.isFeatured ? t('unpinItem') : t('pinItem')}
          >
            <Pin
              className={`size-3.5 ${item.isFeatured ? 'fill-amber text-amber' : ''}`}
            />
          </Button>
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
  const locale = useLocale();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [editing, setEditing] = useState<Partial<Item> | null>(null);
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState('');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') return 12;
    const n = Number(localStorage.getItem('items-page-size'));
    return [12, 24, 48].includes(n) ? n : 12;
  });

  const [variants, setVariants] = useState<VariantRow[]>([]);

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

  const missingPhotos = items.filter((i) => !i.imageUrl).length;

  const filtered = useMemo(() => {
    let result = items;
    if (filterCategory) {
      result = result.filter((item) => item.categoryId === filterCategory);
    }
    if (missingOnly) {
      result = result.filter((item) => !item.imageUrl);
    }
    if (search) {
      const q = search.toLowerCase();
      result = result.filter((item) => item.name.toLowerCase().includes(q));
    }
    return result;
  }, [items, filterCategory, missingOnly, search]);

  // Pagination is view-only: drag-reorder keeps operating on the full
  // filtered array, so displayOrder stays globally consistent.
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount - 1);
  const paged = filtered.slice(safePage * pageSize, safePage * pageSize + pageSize);

  function resetPage() {
    setPage(0);
  }

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
      basePrice: variants.length ? null : (parseFloat(data.get('basePrice') as string) || null),
      imageUrl: (data.get('imageUrl') as string) || null,
      isAvailable: data.get('isAvailable') === 'on',
      displayOrder: Number(data.get('displayOrder')),
      isFeatured: data.get('isFeatured') === 'on',
      featuredUntil: (data.get('featuredUntil') as string) || null,
      variants: variants.filter((v) => v.label.trim()),
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

  async function toggleFeatured(item: Item) {
    await api.patch(`/api/items/${item.id}/featured`, { isFeatured: !item.isFeatured });
    load();
  }

  const [preview, setPreview] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await api.post('/api/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setPreview(res.data.url);
    } finally {
      setUploading(false);
    }
  }

  function openEdit(item?: Item) {
    const defaults: Partial<Item> = item ?? {
      id: '',
      categoryId: '',
      name: '',
      description: '',
      basePrice: null,
      imageUrl: null,
      isAvailable: true,
      displayOrder: 0,
      isFeatured: false,
      featuredUntil: null,
      translations: [],
      variants: [],
    };
    setPreview(item?.imageUrl ?? null);
    setVariants(item?.variants ?? []);
    setEditing(defaults);
    setCategoryId(defaults.categoryId ?? '');
    setOpen(true);
  }

  function addVariant() {
    setVariants((prev) => [...prev, { label: '', labelEn: '', price: 0 }]);
  }

  function updateVariant(index: number, field: keyof VariantRow, value: string | number) {
    setVariants((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  }

  function removeVariant(index: number) {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('items')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('itemCount', { count: items.length })}</p>
          <p className={`text-sm mt-1 font-medium ${missingPhotos > 0 ? 'text-amber' : 'text-muted-foreground'}`}>
            {t('photoScore', { missing: missingPhotos, total: items.length })}
          </p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addItem')}
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Input
          placeholder={t('searchItems')}
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            resetPage();
          }}
          className="max-w-64"
        />
        <button
          onClick={() => {
            setMissingOnly((v) => !v);
            resetPage();
          }}
          className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors shrink-0 ${
            missingOnly
              ? 'bg-amber text-white'
              : 'bg-muted text-muted-foreground hover:text-foreground'
          }`}
        >
          {t('missingOnly')}
        </button>
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => {
                setFilterCategory(null);
                resetPage();
              }}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filterCategory === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('all')}
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setFilterCategory(c.id);
                  resetPage();
                }}
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
        <SortableContext items={paged.map((i) => i.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {paged.map((item) => (
              <SortableCard
                key={item.id}
                item={item}
                onEdit={openEdit}
                onRemove={remove}
                onToggleAvailability={toggleAvailability}
                onToggleFeatured={toggleFeatured}
                t={t}
                locale={locale}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
      <PagerControls
        page={safePage}
        pageCount={pageCount}
        onPage={setPage}
        pageSize={pageSize}
        onPageSize={(n) => {
          setPageSize(n);
          localStorage.setItem('items-page-size', String(n));
          setPage(0);
        }}
        pageSizeOptions={[12, 24, 48]}
      />

      <Dialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) {
            setPreview(null);
            setVariants([]);
            setEditing(null);
          }
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-xl">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('items')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4 max-h-[85dvh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <Label>{t('displayOrder')}</Label>
                  <Input name="displayOrder" type="number" defaultValue={editing?.displayOrder} />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t('name')}</Label>
                <Input name="name" defaultValue={editing?.name} required dir="auto" />
              </div>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input name="description" defaultValue={editing?.description ?? ''} dir="auto" />
              </div>

              {/* Price / Variants */}
              {variants.length === 0 ? (
                <div className="space-y-2">
                  <Label>{t('basePriceSyp')}</Label>
                  <Input name="basePrice" type="number" step="any" defaultValue={editing?.basePrice ?? ''} />
                </div>
              ) : (
                <input type="hidden" name="basePrice" value="" />
              )}

              <div className="border rounded-lg p-4 space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium text-muted-foreground tracking-wide">{t('variants')}</Label>
                  <Button type="button" variant="outline" size="xs" onClick={addVariant}>
                    <Plus className="size-3" /> {t('addVariant')}
                  </Button>
                </div>
                {variants.map((v, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Input
                      placeholder={t('variantLabelAr')}
                      value={v.label}
                      onChange={(e) => updateVariant(i, 'label', e.target.value)}
                      className="w-24"
                      dir="auto"
                    />
                    <Input
                      placeholder={t('variantLabelEn')}
                      value={v.labelEn}
                      onChange={(e) => updateVariant(i, 'labelEn', e.target.value)}
                      className="w-24"
                      dir="auto"
                    />
                    <Input
                      type="number"
                      step="any"
                      placeholder={t('price')}
                      value={v.price || ''}
                      onChange={(e) => updateVariant(i, 'price', parseFloat(e.target.value) || 0)}
                      className="w-28"
                    />
                    <Button type="button" variant="ghost" size="xs" onClick={() => removeVariant(i)}>
                      <Trash2 className="size-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                {variants.length === 0 && <p className="text-xs text-muted-foreground">{t('variantsHint')}</p>}
              </div>

              {/* Image */}
              <div className="space-y-2">
                <Label>{t('image')}</Label>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => document.getElementById('image-upload')?.click()}
                  >
                    <Upload className="size-3.5" />
                    {uploading ? t('uploading') : t('upload')}
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
                <input type="hidden" name="imageUrl" value={preview ?? ''} />
                {preview && (
                  <div className="relative mt-2 inline-block">
                    <img
                      src={preview}
                      alt={t('image')}
                      className="w-32 h-24 rounded-lg object-cover ring-1 ring-foreground/10"
                    />
                    <button
                      type="button"
                      onClick={() => setPreview(null)}
                      className="absolute -top-1.5 -right-1.5 size-5 rounded-full bg-background ring-1 ring-foreground/10 flex items-center justify-center hover:bg-muted"
                    >
                      <X className="size-3" />
                    </button>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input name="isAvailable" type="checkbox" defaultChecked={editing?.isAvailable} />
                {t('isAvailable')}
              </label>

              <div className="flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm">
                  <input name="isFeatured" type="checkbox" defaultChecked={editing?.isFeatured} />
                  {t('isFeatured')}
                </label>
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  {t('featuredUntil')}
                  <Input
                    name="featuredUntil"
                    type="date"
                    defaultValue={editing?.featuredUntil ? editing.featuredUntil.slice(0, 10) : ''}
                    className="w-auto"
                  />
                </label>
              </div>

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
