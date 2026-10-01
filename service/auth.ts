import { api } from '@/lib/api';
import { toApiError } from './errors';
import type { AuthUser } from './types';

export async function getSession(): Promise<{ user: AuthUser | null }> {
  try {
    const res = await api.get('/api/auth/get-session', { withCredentials: true });
    return { user: (res.data?.user as AuthUser | undefined) ?? null };
  } catch (err) {
    throw toApiError(err);
  }
}

export async function getCurrentUser(): Promise<AuthUser> {
  try {
    const res = await api.get('/api/users/me', { withCredentials: true });
    return res.data as AuthUser;
  } catch (err) {
    throw toApiError(err);
  }
}

export async function signInWithUsername(
  username: string,
  password: string,
): Promise<{ token?: string }> {
  try {
    const res = await api.post('/api/auth/sign-in/username', { username, password });
    return res.data as { token?: string };
  } catch (err) {
    throw toApiError(err, 'Invalid credentials');
  }
}

export async function signOut(): Promise<void> {
  try {
    await api.post('/api/auth/sign-out', {}, { withCredentials: true });
  } catch (err) {
    throw toApiError(err);
  }
}
