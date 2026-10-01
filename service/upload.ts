import { api } from '@/lib/api';
import { toApiError } from './errors';

export async function uploadImage(file: File, tenantId?: string): Promise<{ url: string }> {
  try {
    const fd = new FormData();
    fd.append('file', file);
    if (tenantId) fd.append('tenantId', tenantId);
    const res = await api.post('/api/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data as { url: string };
  } catch (err) {
    throw toApiError(err);
  }
}
