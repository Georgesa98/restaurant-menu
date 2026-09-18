'use client';

import { useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DataTable } from './data-table';
import { getTenantColumns, type TenantRow } from './tenants-columns';

type Tenant = TenantRow & {
  domain: string | null;
  plan: string;
  isActive: boolean;
  defaultLocale: string;
  availableLocales: string[];
  description: string | null;
  address: string | null;
  phone: string | null;
  customCss: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  createdAt: string;
};

type Device = {
  id: string;
  deviceId: string;
  lastSeen: string;
  appVersion: string | null;
  locale: string | null;
};

function timeAgo(iso: string, now: number, t: (key: string, values?: Record<string, string | number>) => string): string {
  const mins = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (mins < 1) return t('justNow');
  if (mins < 60) return t('minutesAgo', { count: mins });
  const hours = Math.round(mins / 60);
  if (hours < 24) return t('hoursAgo', { count: hours });
  return t('daysAgo', { count: Math.round(hours / 24) });
}

export function TenantsView() {
  const t = useTranslations('admin');
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [editing, setEditing] = useState<Partial<Tenant> | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [devices, setDevices] = useState<Device[]>([]);
  const [fleetTenant, setFleetTenant] = useState('');
  const [fleetLoading, setFleetLoading] = useState(false);
  const [fleetNow, setFleetNow] = useState(() => Date.now());

  async function load() {
    setLoading(true);
    try {
      const res = await api.get('/api/tenants');
      setTenants(res.data);
      setFleetTenant((prev) => prev || res.data[0]?.id || '');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!fleetTenant) {
      setDevices([]);
      return;
    }
    setFleetLoading(true);
    api
      .get(`/api/tenants/${fleetTenant}/devices`)
      .then((res) => {
        setDevices(res.data);
        setFleetNow(Date.now());
      })
      .catch(() => setDevices([]))
      .finally(() => setFleetLoading(false));
  }, [fleetTenant, tenants]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    const form = e.target as HTMLFormElement;
    const data = new FormData(form);

    const base = {
      name: data.get('name') as string,
      slug: data.get('slug') as string,
      domain: (data.get('domain') as string) || null,
      plan: data.get('plan') as string,
      isActive: data.get('isActive') === 'on',
      defaultLocale: data.get('defaultLocale') as string,
      description: (data.get('description') as string) || null,
      address: (data.get('address') as string) || null,
      phone: (data.get('phone') as string) || null,
      customCss: (data.get('customCss') as string) || null,
    };

    if (editing.id) {
      await api.put(`/api/tenants/${editing.id}`, base);
    } else {
      await api.post('/api/tenants', base);
    }

    setOpen(false);
    setEditing(null);
    load();
  }

  async function remove(id: string) {
    if (!confirm(t('confirmDelete'))) return;
    await api.delete(`/api/tenants/${id}`);
    load();
  }

  async function requestSync(row: TenantRow) {
    await api.post(`/api/tenants/${row.id}/request-sync`);
    load();
  }

  function generateStarterCss(colors: { primary: string; secondary: string; accent: string }) {
    return `/* MenuHost — custom theme CSS */
/* Classes: .menu-page, .menu-header, .menu-title, .menu-tagline, .menu-meta
   .menu-category, .menu-category-header, .menu-category-name
   .menu-items-grid, .menu-item, .menu-card, .menu-item-image
   .menu-item-content, .menu-item-name, .menu-item-price, .menu-item-description
   .menu-item-qty, .menu-item-qty-btn
   .menu-order-bar, .menu-order-bar-inner, .menu-footer
   Variables: var(--primary), var(--secondary), var(--accent),
   var(--bg), var(--surface), var(--text), var(--text-muted),
   var(--font-heading), var(--font-body), var(--radius-md), var(--shadow) */

/* Example: bordered cards with uppercase category names */
.menu-category-name {
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-size: 0.875rem;
}
.menu-item {
  border: 1px solid color-mix(in srgb, ${colors.secondary} 15%, transparent);
  border-radius: var(--radius-md);
}
.menu-item-image img {
  transition: transform 0.3s ease;
}
.menu-item:hover .menu-item-image img {
  transform: scale(1.05);
}
.menu-item-price {
  background: ${colors.primary}10;
  padding: 0.125rem 0.5rem;
  border-radius: 999px;
  font-size: 0.8125rem;
}`;
  }

  function openEdit(tenant?: Tenant) {
    setEditing(
      tenant ?? {
        id: '',
        name: '',
        slug: '',
        domain: '',
        plan: 'FREE',
        isActive: true,
        defaultLocale: 'en',
        availableLocales: ['en'],
        description: '',
        address: '',
        phone: '',
        customCss: '',
        _count: { categories: 0, items: 0 },
        primaryColor: '#e74c3c',
        secondaryColor: '#2c3e50',
        accentColor: '#f39c12',
        createdAt: '',
      },
    );
    setOpen(true);
  }

  const columns = useMemo(
    () =>
      getTenantColumns(t, {
        onEdit: (row) => openEdit(tenants.find((x) => x.id === row.id) ?? undefined),
        onRemove: remove,
        onRequestSync: requestSync,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [tenants, t],
  );

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('tenants')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('tenantCount', { count: tenants.length })}</p>
        </div>
        <Button onClick={() => openEdit()}>
          <Plus className="size-4" />
          {t('addTenant')}
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={tenants}
        searchKey="name"
        searchPlaceholder={t('searchTenants')}
        isLoading={loading}
      />

      <div className="mt-8 max-w-5xl">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold">{t('fleet')}</h2>
          {tenants.length > 0 && (
            <select
              value={fleetTenant}
              onChange={(e) => setFleetTenant(e.target.value)}
              className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
            >
              {tenants.map((x) => (
                <option key={x.id} value={x.id}>
                  {x.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {fleetLoading ? (
          <p className="text-sm text-muted-foreground">{t('loading')}</p>
        ) : devices.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t('noDevices')}</p>
        ) : (
          <ul className="divide-y divide-foreground/5 rounded-xl ring-1 ring-foreground/5 bg-card">
            {devices.map((d) => {
              const stale = fleetNow - new Date(d.lastSeen).getTime() > 30 * 60000;
              return (
                <li key={d.id} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <span className="flex items-center gap-2 font-mono text-xs">
                    <span className={`size-2 rounded-full ${stale ? 'bg-muted-foreground/30' : 'bg-green-500'}`} />
                    {d.deviceId}
                  </span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {timeAgo(d.lastSeen, fleetNow, t)}
                    {d.appVersion ? ` · v${d.appVersion}` : ''}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg">
          <form onSubmit={save}>
            <DialogHeader>
              <DialogTitle>
                {editing?.id ? t('edit') : t('create')} {t('tenant')}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[85dvh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('name')}</Label>
                  <Input name="name" defaultValue={editing?.name} required dir="auto" />
                </div>
                <div className="space-y-2">
                  <Label>{t('slug')}</Label>
                  <Input name="slug" defaultValue={editing?.slug} required dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>{t('domain')}</Label>
                <Input name="domain" defaultValue={editing?.domain ?? ''} placeholder="e.g. luigispizzeria.com" dir="ltr" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('plan')}</Label>
                  <select
                    name="plan"
                    defaultValue={editing?.plan ?? 'FREE'}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="FREE">Free</option>
                    <option value="STARTER">Starter</option>
                    <option value="PRO">Pro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>{t('defaultLocale')}</Label>
                  <select
                    name="defaultLocale"
                    defaultValue={editing?.defaultLocale ?? 'en'}
                    className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                  >
                    <option value="en">English</option>
                    <option value="ar">Arabic</option>
                  </select>
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input name="isActive" type="checkbox" defaultChecked={editing?.isActive} />
                {t('active')}
              </label>
              <div className="space-y-2">
                <Label>{t('description')}</Label>
                <Input name="description" defaultValue={editing?.description ?? ''} dir="auto" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>{t('address')}</Label>
                  <Input name="address" defaultValue={editing?.address ?? ''} dir="auto" />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input name="phone" defaultValue={editing?.phone ?? ''} dir="ltr" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>{t('customCss')}</Label>
                  <button
                    type="button"
                    onClick={() => {
                      const ta = document.querySelector<HTMLTextAreaElement>('[name="customCss"]');
                      if (ta) {
                        const p = editing?.primaryColor ?? '#e74c3c';
                        const s = editing?.secondaryColor ?? '#2c3e50';
                        const a = editing?.accentColor ?? '#f39c12';
                        ta.value = generateStarterCss({ primary: p, secondary: s, accent: a });
                      }
                    }}
                    className="text-xs text-primary hover:underline"
                  >
                    {t('generateStarter')}
                  </button>
                </div>
                <textarea
                  name="customCss"
                  defaultValue={editing?.customCss ?? ''}
                  className="w-full rounded-lg border border-input bg-transparent p-3 text-xs font-mono leading-relaxed"
                  rows={10}
                  dir="ltr"
                  placeholder="/* Write CSS here. Leave empty for default styling. */"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="submit">{t('save')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
