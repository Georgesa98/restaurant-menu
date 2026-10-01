'use client';

import { useEffect, useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/admin/auth-provider';
import {
  deleteItem,
  getAllCategories,
  getAllItems,
  reorderItems,
  setItemAvailability,
  setItemFeatured,
} from '@/service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';
import { PagerControls } from '@/components/admin/data-table';
import { ItemCard } from '@/components/admin/item-card';
import type { CategoryOption, Item } from '@/types/item.types';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, rectSortingStrategy } from '@dnd-kit/sortable';

export default function ItemsPage() {
  const t = useTranslations('admin');
  const locale = useLocale();
  const router = useRouter();
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [missingOnly, setMissingOnly] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(() => {
    if (typeof window === 'undefined') return 12;
    const n = Number(localStorage.getItem('items-page-size'));
    return [12, 24, 48].includes(n) ? n : 12;
  });

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function getItems() {
    setItems(await getAllItems(tenantId));
  }

  async function getCategories() {
    setCategories(await getAllCategories(tenantId));
  }

  useEffect(() => {
    getItems();
    getCategories();
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
    if (oldIndex < 0 || newIndex < 0) return;

    const reordered = [...filtered];
    const [moved] = reordered.splice(oldIndex, 1);
    reordered.splice(newIndex, 0, moved);

    const updated = reordered.map((i, idx) => ({ ...i, displayOrder: idx }));
    setItems((prev) => {
      const map = new Map(updated.map((i) => [i.id, i]));
      return prev.map((i) => map.get(i.id) ?? i);
    });

    await reorderItems(updated.map((i) => ({ id: i.id, displayOrder: i.displayOrder })));
  }

  async function removeItem(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await deleteItem(id);
    getItems();
  }

  async function toggleAvailability(item: Item) {
    await setItemAvailability(item.id, !item.isAvailable);
    getItems();
  }

  async function toggleFeatured(item: Item) {
    await setItemFeatured(item.id, !item.isFeatured);
    getItems();
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
        <Button onClick={() => router.push('/admin/items/new')}>
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
            missingOnly ? 'bg-amber text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
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
              <ItemCard
                key={item.id}
                item={item}
                onEdit={(i) => router.push(`/admin/items/${i.id}/edit`)}
                onDelete={removeItem}
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
    </div>
  );
}
