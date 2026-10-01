import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { Tenant, TenantDetail, TenantRow } from './types';

export type UpsertTenantPayload = {
  name: string;
  slug: string;
  domain: string | null;
  plan: string;
  isActive: boolean;
  defaultLocale: string;
  description: string | null;
  address: string | null;
  phone: string | null;
  [themeKey: string]: unknown;
};

export async function getAllTenants(): Promise<TenantRow[]> {
  try {
    const res = await api.get('/api/tenants');
    return res.data as TenantRow[];
  } catch (err) {
    throw toApiError(err);
  }
}

/** Lightweight id+name list used by tenant <select> dropdowns. */
export async function getTenantOptions(): Promise<Tenant[]> {
  const tenants = await getAllTenants();
  return tenants as unknown as Tenant[];
}

export async function getTenant(id: string): Promise<TenantDetail> {
  try {
    const res = await api.get(`/api/tenants/${id}`);
    return res.data as TenantDetail;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createTenant(payload: UpsertTenantPayload): Promise<TenantDetail> {
  try {
    const res = await api.post('/api/tenants', payload);
    return res.data as TenantDetail;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateTenant(id: string, payload: UpsertTenantPayload): Promise<TenantDetail> {
  try {
    const res = await api.put(`/api/tenants/${id}`, payload);
    return res.data as TenantDetail;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteTenant(id: string): Promise<void> {
  try {
    await api.delete(`/api/tenants/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function requestTenantSync(id: string): Promise<void> {
  try {
    await api.post(`/api/tenants/${id}/request-sync`);
  } catch (err) {
    throw toApiError(err);
  }
}
