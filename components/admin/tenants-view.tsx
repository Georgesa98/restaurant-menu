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
import {
  THEME_PRESETS,
  DEFAULT_TOKENS,
  HEADING_FONT_OPTIONS,
  BODY_FONT_OPTIONS,
  RADIUS_OPTIONS,
  SHADOW_ON,
  SHADOW_OFF,
  type ThemeTokens,
} from '@/lib/tenant-presets';

type Tenant = TenantRow & {
  domain: string | null;
  plan: string;
  isActive: boolean;
  defaultLocale: string;
  availableLocales: string[];
  description: string | null;
  address: string | null;
  phone: string | null;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  surfaceColor: string;
  textColor: string;
  textMuted: string;
  headingFont: string;
  bodyFont: string;
  borderRadiusSm: string;
  borderRadiusMd: string;
  borderRadiusLg: string;
  shadow: string;
  createdAt: string;
};

function tokensFromTenant(t?: Partial<Tenant>): ThemeTokens {
  return {
    primaryColor: t?.primaryColor ?? DEFAULT_TOKENS.primaryColor,
    secondaryColor: t?.secondaryColor ?? DEFAULT_TOKENS.secondaryColor,
    accentColor: t?.accentColor ?? DEFAULT_TOKENS.accentColor,
    backgroundColor: t?.backgroundColor ?? DEFAULT_TOKENS.backgroundColor,
    surfaceColor: t?.surfaceColor ?? DEFAULT_TOKENS.surfaceColor,
    textColor: t?.textColor ?? DEFAULT_TOKENS.textColor,
    textMuted: t?.textMuted ?? DEFAULT_TOKENS.textMuted,
    headingFont: t?.headingFont ?? DEFAULT_TOKENS.headingFont,
    bodyFont: t?.bodyFont ?? DEFAULT_TOKENS.bodyFont,
    borderRadiusSm: t?.borderRadiusSm ?? DEFAULT_TOKENS.borderRadiusSm,
    borderRadiusMd: t?.borderRadiusMd ?? DEFAULT_TOKENS.borderRadiusMd,
    borderRadiusLg: t?.borderRadiusLg ?? DEFAULT_TOKENS.borderRadiusLg,
    shadow: t?.shadow ?? DEFAULT_TOKENS.shadow,
  };
}

const COLOR_FIELDS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'textMuted',
] as const;

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
  const [tokens, setTokens] = useState<ThemeTokens>(DEFAULT_TOKENS);

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
      ...tokens,
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
        ...DEFAULT_TOKENS,
        _count: { categories: 0, items: 0 },
        createdAt: '',
      },
    );
    setTokens(tokensFromTenant(tenant));
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
              <div className="border-t pt-4 space-y-4">
                <p className="text-xs font-medium text-muted-foreground tracking-wide">{t('appearance')}</p>
                <div className="space-y-2">
                  <Label>{t('themePreset')}</Label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {THEME_PRESETS.map((p) => {
                      const active = JSON.stringify(tokens) === JSON.stringify(p.tokens);
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setTokens(p.tokens)}
                          aria-pressed={active}
                          className={`rounded-lg border p-2 text-left transition-colors ${
                            active ? 'border-primary ring-1 ring-primary' : 'border-input hover:border-primary/50'
                          }`}
                        >
                          <span
                            className="flex h-10 items-center justify-center rounded-md"
                            style={{ background: p.tokens.backgroundColor }}
                          >
                            <span
                              className="size-4 rounded-full"
                              style={{ background: p.tokens.primaryColor }}
                            />
                          </span>
                          <span className="mt-1.5 block text-xs font-medium">{t(p.labelKey)}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {COLOR_FIELDS.map((field) => (
                    <div key={field} className="space-y-1.5">
                      <Label>{t(field)}</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={tokens[field]}
                          onChange={(e) => setTokens((prev) => ({ ...prev, [field]: e.target.value }))}
                          className="size-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
                          aria-label={t(field)}
                        />
                        <span className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                          {tokens[field]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>{t('headingFont')}</Label>
                    <select
                      value={tokens.headingFont}
                      onChange={(e) => setTokens((prev) => ({ ...prev, headingFont: e.target.value }))}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      {HEADING_FONT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('bodyFont')}</Label>
                    <select
                      value={tokens.bodyFont}
                      onChange={(e) => setTokens((prev) => ({ ...prev, bodyFont: e.target.value }))}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      {BODY_FONT_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>{t('cornerStyle')}</Label>
                    <select
                      value={RADIUS_OPTIONS.find((o) => o.tokens.borderRadiusLg === tokens.borderRadiusLg)?.value ?? ''}
                      onChange={(e) => {
                        const opt = RADIUS_OPTIONS.find((o) => o.value === e.target.value);
                        if (opt) setTokens((prev) => ({ ...prev, ...opt.tokens }));
                      }}
                      className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                    >
                      {RADIUS_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {t(o.labelKey)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={tokens.shadow !== SHADOW_OFF}
                    onChange={(e) => setTokens((prev) => ({ ...prev, shadow: e.target.checked ? SHADOW_ON : SHADOW_OFF }))}
                  />
                  {t('cardShadow')}
                </label>
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
