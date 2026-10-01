import { api } from '@/lib/api';
import type { CreateUserInput, EditUserInput } from '@/lib/validations/user';
import { toApiError } from './errors';
import type { UserRow } from './types';

export async function getAllUsers(): Promise<UserRow[]> {
  try {
    const res = await api.get('/api/users');
    return res.data as UserRow[];
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getUser(id: string): Promise<UserRow> {
  try {
    const res = await api.get(`/api/users/${id}`);
    return res.data as UserRow;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function createUser(payload: CreateUserInput): Promise<UserRow> {
  try {
    const res = await api.post('/api/users', payload);
    return res.data as UserRow;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function updateUser(id: string, payload: EditUserInput): Promise<UserRow> {
  try {
    const res = await api.patch(`/api/users/${id}`, payload);
    return res.data as UserRow;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function deleteUser(id: string): Promise<void> {
  try {
    await api.delete(`/api/users/${id}`);
  } catch (err) {
    throw toApiError(err);
  }
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  try {
    await api.post(`/api/users/${id}/active`, { isActive });
  } catch (err) {
    throw toApiError(err);
  }
}

export async function resetUserPassword(id: string, password: string): Promise<void> {
  try {
    await api.post(`/api/users/${id}/password`, { password });
  } catch (err) {
    throw toApiError(err);
  }
}
