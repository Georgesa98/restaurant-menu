'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import axios from 'axios';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UtensilsCrossed } from 'lucide-react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const t = useTranslations('admin');

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/auth/sign-in/username', { username, password });
      if (res.data.token) {
        router.push(`/admin`);
      }
    } catch (err) {
      // axios throws identically for HTTP errors and network failures —
      // don't blame the credentials when the server is unreachable.
      if (axios.isAxiosError(err) && !err.response) {
        setError(t('serverUnreachable'));
      } else {
        setError(t('invalidCredentials'));
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-dvh bg-gradient-to-b from-background to-muted/60 px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100dvh-5rem)] w-full max-w-sm flex-col justify-center">
        <div className="mb-8 space-y-3 text-center">
          <div className="mx-auto flex size-13 w-fit items-center justify-center rounded-2xl bg-primary p-3 text-primary-foreground shadow-lg shadow-primary/25">
            <UtensilsCrossed className="size-7" strokeWidth={1.8} />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MenuHost</h1>
            <p className="mt-1 text-sm text-muted-foreground">Restaurant menu management</p>
          </div>
        </div>
        <Card className="border-border/70 shadow-xl shadow-black/[0.04]">
          <CardHeader className="pb-2 text-center">
            <CardTitle className="text-lg">{t('login')}</CardTitle>
            <CardDescription>Sign in to manage your menus</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div
                  role="alert"
                  className="rounded-xl border border-destructive/25 bg-destructive/[0.07] px-3.5 py-2.5 text-[13px] font-medium text-destructive"
                >
                  {error}
                </div>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="username">{t('username')}</Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="superadmin"
                  required
                  autoFocus
                  autoComplete="username"
                  className="h-10 bg-background"
                  dir="ltr"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">{t('password')}</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="h-10 bg-background"
                />
              </div>
              <Button type="submit" disabled={loading} className="h-10 w-full text-[15px] font-semibold">
                {loading ? t('signingIn') : t('login')}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Protected area — authorized staff only
        </p>
      </div>
    </div>
  );
}
