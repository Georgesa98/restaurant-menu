import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { Item, ReorderInput } from './types';

export type CreateItemPayload = {
  categoryId: string;
  name: string;
  description: string | null;
  basePrice: number | null;
  imageUrl: string | null;
  isAvailable: boolean;
  displayOrder: number;
  isFeatured: boolean;
  featuredUntil: string | null;
  variants: { label: string; labelEn?: string; price: number }[];
  tenantId?: string | null;
};

export type UpdateItemPayload = Omit<CreateItemPayload, 'tenantId'>;

export async function getAllItems(tenantId?: string | null): Promise<Item[]> {
  try {
    const res = await api.get('/api/items', { params: { tenantId } });
    return res.data as Item[];
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getItem(id: string): Promise<Item> {
  try {
    const res = await api.get(`/api/items/${id}`);
    return res.data as Item;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createItem(payload: CreateItemPayload): Promise<Item> {
  try {
    const res = await api.post('/api/items', payload);
    return res.data as Item;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateItem(id: string, payload: UpdateItemPayload): Promise<Item> {
  try {
    const res = await api.put(`/api/items/${id}`, payload);
    return res.data as Item;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    await api.delete(`/api/items/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function reorderItems(items: ReorderInput[]): Promise<void> {
  try {
    await api.patch('/api/items/reorder', { items });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function setItemAvailability(id: string, isAvailable: boolean): Promise<void> {
  try {
    await api.patch(`/api/items/${id}/availability`, { isAvailable });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function setItemFeatured(id: string, isFeatured: boolean): Promise<void> {
  try {
    await api.patch(`/api/items/${id}/featured`, { isFeatured });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteItems(ids: string[]): Promise<void> {
  try {
    await api.delete('/api/items', { data: { ids } });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function setItemsAvailability(ids: string[], isAvailable: boolean): Promise<void> {
  try {
    await api.patch('/api/items/availability', { ids, isAvailable });
  } catch (err) {
    throw toApiError(err);
  }
}
