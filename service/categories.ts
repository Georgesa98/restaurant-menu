import { api } from '@/lib/api';
import type { CategoryFormInput } from '@/lib/validations/category';
import { toApiError } from './errors';
import type { Category, CategoryWithItems, ReorderInput } from './types';

export async function getAllCategories(tenantId?: string | null): Promise<CategoryWithItems[]> {
  try {
    const res = await api.get('/api/categories', { params: { tenantId } });
    return res.data as CategoryWithItems[];
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getCategory(id: string): Promise<CategoryWithItems> {
  try {
    const res = await api.get(`/api/categories/${id}`);
    return res.data as CategoryWithItems;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createCategory(
  payload: CategoryFormInput & { tenantId: string | null },
): Promise<Category> {
  try {
    const res = await api.post('/api/categories', payload);
    return res.data as Category;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateCategory(id: string, payload: CategoryFormInput): Promise<Category> {
  try {
    const res = await api.put(`/api/categories/${id}`, payload);
    return res.data as Category;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await api.delete(`/api/categories/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function reorderCategories(items: ReorderInput[]): Promise<void> {
  try {
    await api.patch('/api/categories/reorder', { items });
  } catch (err) {
    throw toApiError(err);
  }
}
