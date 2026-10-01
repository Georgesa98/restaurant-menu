import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { Device } from './types';

export async function getTenantDevices(tenantId: string): Promise<Device[]> {
  try {
    const res = await api.get(`/api/tenants/${tenantId}/devices`);
    return res.data as Device[];
  } catch (err) {
    throw toApiError(err);
  }
}
