import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { TranslationPayload } from './types';

/**
 * Translation upserts. The `PUT [.../locale]` routes are idempotent upserts,
 * so both create and edit flows go through PUT (the old category create page
 * used POST against a PUT-only route).
 */
export async function upsertCategoryTranslation(
  id: string,
  locale: string,
  payload: TranslationPayload,
): Promise<void> {
  try {
    await api.put(`/api/translations/categories/${id}/${locale}`, payload);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function upsertItemTranslation(
  id: string,
  locale: string,
  payload: TranslationPayload,
): Promise<void> {
  try {
    await api.put(`/api/translations/items/${id}/${locale}`, payload);
  } catch (err) {
    throw toApiError(err);
  }
}
