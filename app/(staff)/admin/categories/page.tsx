'use client';
import { useAuth } from '@/components/admin/auth-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { GripVertical, ImageOff, Pencil, Plus, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';

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

type CategoryWithItems = Omit<Category, 'coverImage'> & {
  items?: { imageUrl: string | null }[];
};

export default function CategoriesPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [cats, setCats] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  const tenantId = user?.role === 'SUPER_ADMIN' ? '' : user?.tenantId;

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  async function getCategories() {
    setLoading(true);
    try {
      const res = await api.get('/api/categories', { params: { tenantId } });
      const categories = res.data as CategoryWithItems[];
      setCats(
        categories.map((c) => ({
          ...c,
          coverImage: c.items?.[0]?.imageUrl ?? null,
        })),
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getCategories();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return cats;
    return cats.filter((c) => c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q));
  }, [cats, search]);

  const isFiltering = search.trim() !== '';

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

  async function deleteCategory(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/api/categories/${id}`);
    getCategories();
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('categories')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('categoryCount', { count: cats.length })}</p>
        </div>
        <Button onClick={() => router.push('new')}>
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
        <p>{t('loading')}</p>
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
                  dragDisabled={isFiltering}
                  t={t}
                  onEdit={() => router.push(cat.id + '/edit')}
                  onDelete={() => deleteCategory(cat.id)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableCategoryRow({
  cat,
  dragDisabled,
  t,
  onEdit,
  onDelete,
}: {
  cat: Category;
  dragDisabled: boolean;
  t: (key: string) => string;
  onEdit: () => void;
  onDelete: () => void;
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
        {cat.description && <p className="text-xs text-muted-foreground truncate mt-1">{cat.description}</p>}
      </div>
      <div className="flex gap-1 shrink-0">
        <Button variant="ghost" size="xs" aria-label={t('edit')} onClick={onEdit}>
          <Pencil className="size-3.5" />
        </Button>
        <Button variant="ghost" size="xs" aria-label={t('delete')} onClick={onDelete}>
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
