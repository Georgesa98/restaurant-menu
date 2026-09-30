'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ImageOff, Pencil, Pin, Trash2, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Item } from '../../types/item.types';

function formatSyp(n: number, locale: string, isRange = false): string {
  const num = n.toLocaleString('en-US');
  return locale === 'ar' ? `${num} ل.س${isRange ? '+' : ''}` : `SYP ${num}${isRange ? '+' : ''}`;
}

export function ItemCard({
  item,
  onEdit,
  onDelete,
  onToggleAvailability,
  onToggleFeatured,
  t,
  locale,
}: {
  item: Item;
  onEdit: (item: Item) => void;
  onDelete: (id: string) => void;
  onToggleAvailability: (item: Item) => void;
  onToggleFeatured: (item: Item) => void;
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
          item.variants.length ? Math.min(...item.variants.map((v) => v.price)) : Number(item.basePrice),
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
            <Pin className={`size-3.5 ${item.isFeatured ? 'fill-amber text-amber' : ''}`} />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onEdit(item)}>
            <Pencil className="size-3.5" />
          </Button>
          <Button variant="ghost" size="xs" onClick={() => onDelete(item.id)}>
            <Trash2 className="size-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
