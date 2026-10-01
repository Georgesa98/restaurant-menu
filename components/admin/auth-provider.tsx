'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser, getSession, signOut as signOutRequest } from '@/service';

type User = {
  id: string;
  email: string;
  name: string;
  role: string;
  tenantId: string | null;
  username?: string | null;
  displayUsername?: string | null;
};

type AuthContext = {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const AuthCtx = createContext<AuthContext>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    (async () => {
      try {
        const { user } = await getSession();
        if (!user) {
          router.replace(`/admin/login`);
          return;
        }
        // Deactivation is enforced server-side (requireSession reads it from
        // the DB), so /api/users/me 403s for deactivated accounts.
        await getCurrentUser();
        setUser(user);
      } catch {
        router.replace(`/admin/login`);
      } finally {
        setLoading(false);
      }
    })();
  }, [router]);

  async function signOut() {
    await signOutRequest();
    setUser(null);
    router.replace(`/admin/login`);
  }

  if (loading) {
    return (
      <div className="min-h-dvh flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  return <AuthCtx.Provider value={{ user, loading, signOut }}>{children}</AuthCtx.Provider>;
}

export const useAuth = () => useContext(AuthCtx);
