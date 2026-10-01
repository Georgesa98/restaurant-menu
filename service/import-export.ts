import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { ImportResult } from './types';

export async function importMenu(json: unknown, tenantId?: string): Promise<ImportResult> {
  try {
    const res = await api.post('/api/import', json, {
      params: tenantId ? { tenantId } : {},
    });
    return res.data as ImportResult;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function exportMenu(tenantId?: string): Promise<Blob> {
  try {
    const params: Record<string, string> = {};
    if (tenantId) params.tenantId = tenantId;
    const res = await api.get('/api/export', {
      params,
      responseType: 'blob',
      headers: { Accept: 'application/json' },
    });
    return new Blob([res.data], { type: 'application/json' });
  } catch (err) {
    throw toApiError(err);
  }
}
