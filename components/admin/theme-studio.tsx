'use client';

import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { api } from '@/lib/api';
import { toast } from '@/components/ui/toast';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search, Star, X } from 'lucide-react';
import { MenuHome } from '@/components/menu/menu-home';
import { MenuQrCode } from '@/components/admin/menu-qr-code';
import { resolveTranslation, type MenuItem } from '@/components/menu/menu-helpers';
import { isLiveFeatured } from '@/lib/search';
import {
  BODY_FONT_OPTIONS,
  CARD_STYLE_OPTIONS,
  HEADING_FONT_OPTIONS,
  MENU_LAYOUT_OPTIONS,
  RADIUS_OPTIONS,
  SHADOW_OFF,
  SHADOW_ON,
  SPACING_OPTIONS,
  THEME_PRESETS,
} from '@/lib/tenant-presets';
import { themeUpdateSchema } from '@/lib/validations/tenant';
import type { TenantData } from '@/lib/types';

const COLOR_FIELDS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'textMuted',
] as const;

const TOKEN_KEYS = [
  'primaryColor',
  'secondaryColor',
  'accentColor',
  'backgroundColor',
  'surfaceColor',
  'textColor',
  'textMuted',
  'headingFont',
  'bodyFont',
  'borderRadiusSm',
  'borderRadiusMd',
  'borderRadiusLg',
  'shadow',
] as const;

const THEME_KEYS = [...TOKEN_KEYS, 'name', 'description', 'cardStyle', 'menuLayout', 'spacing'] as const;

type SectionProps = { title: string; children: ReactNode; hint?: string };

function Section({ title, children, hint }: SectionProps) {
  return (
    <section className="bg-card rounded-xl ring-1 ring-foreground/5 p-4">
      <p className="text-xs font-medium text-muted-foreground tracking-wide mb-3">{title}</p>
      {hint && <p className="text-xs text-muted-foreground -mt-1 mb-3">{hint}</p>}
      {children}
    </section>
  );
}

function mapItems(
  data: TenantData | null,
  fn: (item: MenuItem) => MenuItem,
): TenantData | null {
  if (!data) return data;
  return {
    ...data,
    categories: data.categories.map((c) => ({ ...c, items: c.items.map(fn) })),
  };
}

/**
 * Forgiving search normalization: case-insensitive plus Arabic letter
 * variants (أإآ→ا, ة→ه, ى→ي) so queries match names in either language.
 */
function normalizeSearch(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي');
}

/**
 * Two-column themes workspace: every control on the left, a live phone-frame
 * replica of the public menu on the right. The preview renders the real
 * MenuHome components scoped under #theme-preview, so what you see is the
 * production menu — including container-query mobile styles.
 */
export function ThemeStudio({ tenantId }: { tenantId: string }) {
  const t = useTranslations('admin');
  const appLocale = useLocale();
  const [tenant, setTenant] = useState<TenantData | null>(null);
  const [draft, setDraft] = useState<TenantData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewLocale, setPreviewLocale] = useState<string | null>(null);
  const [featuredQuery, setFeaturedQuery] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get(`/api/tenants/${tenantId}/theme`);
        if (cancelled) return;
        setTenant(res.data);
        setDraft(res.data);
      } catch {
        if (!cancelled) toast.add({ type: 'error', description: t('serverUnreachable') });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  const dirty = useMemo(() => {
    if (!tenant || !draft) return false;
    const a = tenant as unknown as Record<string, unknown>;
    const b = draft as unknown as Record<string, unknown>;
    return THEME_KEYS.some((k) => a[k] !== b[k]);
  }, [tenant, draft]);

  /**
   * Bounded replica for the phone preview: the first active categories with
   * their first available plates (real names, prices, photos, theme tokens —
   * just fewer of them). Rendering the full menu here made the inner page
   * arbitrarily tall; the cap keeps it around phone height.
   */
  const previewTenant: TenantData | null = useMemo(() => {
    if (!draft) return null;
    const PREVIEW_CATEGORIES = 3;
    const PREVIEW_ITEMS = 4;
    const sorted = [...draft.categories]
      .filter((c) => c.isActive)
      .sort((a, b) => a.displayOrder - b.displayOrder);
    const capped = sorted.slice(0, PREVIEW_CATEGORIES).map((c) => ({
      ...c,
      items: [...c.items]
        .filter((i) => i.isAvailable)
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, PREVIEW_ITEMS),
    }));
    // Featured backfill: keep the ⭐ shelf representative when the slice
    // above cut every live-featured plate away.
    if (!capped.some((c) => c.items.some((i) => isLiveFeatured(i)))) {
      const extra = sorted
        .flatMap((c) => c.items)
        .filter((i) => i.isAvailable && isLiveFeatured(i))
        .sort((a, b) => a.displayOrder - b.displayOrder)
        .slice(0, 2);
      if (extra.length > 0 && capped.length > 0) {
        const seen = new Set(capped[0].items.map((i) => i.id));
        capped[0] = {
          ...capped[0],
          items: [...capped[0].items, ...extra.filter((i) => !seen.has(i.id))].slice(
            0,
            PREVIEW_ITEMS + 2,
          ),
        };
      }
    }
    return { ...draft, categories: capped };
  }, [draft]);

  function setField<K extends keyof TenantData>(key: K, value: TenantData[K]) {
    setDraft((d) => (d ? ({ ...d, [key]: value } as TenantData) : d));
  }

  function applyTokens(tokens: Partial<TenantData>) {
    setDraft((d) => (d ? ({ ...d, ...tokens } as TenantData) : d));
  }

  function applyPreset(presetTokens: (typeof THEME_PRESETS)[number]['tokens']) {
    applyTokens({ ...presetTokens });
  }

  function applyRadius(radius: (typeof RADIUS_OPTIONS)[number]) {
    applyTokens(radius.tokens);
  }

  async function save() {
    if (!draft) return;
    const payload = {
      name: draft.name,
      description: draft.description ?? '',
      cardStyle: draft.cardStyle,
      menuLayout: draft.menuLayout,
      spacing: draft.spacing,
      ...Object.fromEntries(TOKEN_KEYS.map((k) => [k, draft[k]])),
    };
    const parsed = themeUpdateSchema.safeParse(payload);
    if (!parsed.success) {
      toast.add({ type: 'error', description: t('saveFailed') });
      return;
    }
    setSaving(true);
    try {
      const res = await api.patch(`/api/tenants/${tenantId}/theme`, parsed.data);
      setTenant((prev) => ({ ...(prev as TenantData), ...res.data }));
      setDraft((prev) => ({ ...(prev as TenantData), ...res.data }));
      toast.add({ type: 'success', description: t('themeSaved') });
    } catch {
      toast.add({ type: 'error', description: t('saveFailed') });
    } finally {
      setSaving(false);
    }
  }

  async function toggleFeatured(item: MenuItem) {
    const next = !item.isFeatured;
    const lapsed =
      next && item.featuredUntil != null && new Date(item.featuredUntil) < new Date();
    const nextUntil = lapsed ? null : item.featuredUntil;
    const patch = {
      isFeatured: next,
      ...(lapsed ? { featuredUntil: null } : {}),
    };
    const update = (i: MenuItem): MenuItem =>
      i.id === item.id
        ? { ...i, isFeatured: next, featuredUntil: nextUntil }
        : i;
    // Optimistic — the preview shelf reacts instantly; roll back on failure.
    setDraft((d) => mapItems(d, update));
    setTenant((d) => mapItems(d, update));
    try {
      await api.patch(`/api/items/${item.id}/featured`, patch);
    } catch {
      const rollback = (i: MenuItem): MenuItem => (i.id === item.id ? item : i);
      setDraft((d) => mapItems(d, rollback));
      setTenant((d) => mapItems(d, rollback));
      toast.add({ type: 'error', description: t('saveFailed') });
    }
  }

  if (loading) return <p>{t('loading')}</p>;
  if (!draft) return <p className="text-sm text-muted-foreground">{t('serverUnreachable')}</p>;

  const searchQuery = normalizeSearch(featuredQuery);
  // Flat index of every plate with its category name, resolved in the
  // admin's language. Matching runs against the base name plus every
  // translation, so a query in Arabic or English finds the plate either way.
  const allPlates = (draft?.categories ?? []).flatMap((cat) =>
    [...cat.items]
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map((item) => ({
        item,
        catName: resolveTranslation(cat, appLocale).name,
      })),
  );
  const matchedPlates = searchQuery
    ? allPlates.filter(({ item }) =>
        [item.name, ...(item.translations ?? []).map((tr) => tr.name)].some((n) =>
          normalizeSearch(n).includes(searchQuery),
        ),
      )
    : [];
  const searchResults = matchedPlates.slice(0, 5);
  const hiddenCount = matchedPlates.length - searchResults.length;
  const pinnedPlates = allPlates.filter(({ item }) => item.isFeatured);
  const radiusValue =
    RADIUS_OPTIONS.find((o) => o.tokens.borderRadiusLg === draft.borderRadiusLg)?.value ?? '';

  return (
    <div className="theme-wide max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-bold">{t('themes')}</h1>
          <p className="text-sm text-muted-foreground mt-1">{t('themesSubtitle')}</p>
        </div>
        <div className="flex gap-2">
          {dirty && (
            <Button variant="outline" onClick={() => setDraft(tenant)} disabled={saving}>
              {t('discard')}
            </Button>
          )}
          <Button onClick={save} disabled={!dirty || saving || !draft.name.trim()}>
            {saving ? t('saving') : t('saveChanges')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_390px] gap-6 items-start">
        <div className="space-y-4 min-w-0">
          <Section title={t('menuInfo')}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="theme-name">{t('name')}</Label>
                <Input
                  id="theme-name"
                  value={draft.name}
                  onChange={(e) => setField('name', e.target.value)}
                  dir="auto"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="theme-description">{t('description')}</Label>
                <textarea
                  id="theme-description"
                  rows={2}
                  value={draft.description ?? ''}
                  onChange={(e) => setField('description', e.target.value)}
                  dir="auto"
                  className="w-full rounded-lg border border-input bg-transparent px-2.5 py-1.5 text-sm"
                />
              </div>
            </div>
          </Section>

          <Section title={t('appearance')}>
            <div className="space-y-2">
              <Label>{t('themePreset')}</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {THEME_PRESETS.map((p) => {
                  const active = TOKEN_KEYS.every((k) => draft[k] === p.tokens[k]);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => applyPreset(p.tokens)}
                      aria-pressed={active}
                      className={`rounded-lg border p-2 text-left transition-colors ${
                        active
                          ? 'border-primary ring-1 ring-primary'
                          : 'border-input hover:border-primary/50'
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {COLOR_FIELDS.map((field) => (
                <div key={field} className="space-y-1.5">
                  <Label htmlFor={`color-${field}`}>{t(field)}</Label>
                  <div className="flex items-center gap-2">
                    <input
                      id={`color-${field}`}
                      type="color"
                      value={draft[field]}
                      onChange={(e) => setField(field, e.target.value)}
                      className="size-8 cursor-pointer rounded border border-input bg-transparent p-0.5"
                      aria-label={t(field)}
                    />
                    <span className="text-xs text-muted-foreground tabular-nums" dir="ltr">
                      {draft[field]}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <Section title={t('typography')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t('headingFont')}</Label>
                <select
                  value={draft.headingFont}
                  onChange={(e) => setField('headingFont', e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {HEADING_FONT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('bodyFont')}</Label>
                <select
                  value={draft.bodyFont}
                  onChange={(e) => setField('bodyFont', e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {BODY_FONT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('cornerStyle')}</Label>
                <select
                  value={radiusValue}
                  onChange={(e) => {
                    const opt = RADIUS_OPTIONS.find((o) => o.value === e.target.value);
                    if (opt) applyRadius(opt);
                  }}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {radiusValue === '' && (
                    <option value="" disabled>
                      {t('cornerCustom')}
                    </option>
                  )}
                  {RADIUS_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <label className="flex items-center gap-2 text-sm mt-3">
              <Checkbox
                checked={draft.shadow !== SHADOW_OFF}
                onCheckedChange={(v) => setField('shadow', v ? SHADOW_ON : SHADOW_OFF)}
              />
              {t('cardShadow')}
            </label>
          </Section>

          <Section title={t('layoutStyle')}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>{t('cardStyle')}</Label>
                <select
                  value={draft.cardStyle}
                  onChange={(e) => setField('cardStyle', e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {CARD_STYLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('menuLayout')}</Label>
                <select
                  value={draft.menuLayout}
                  onChange={(e) => setField('menuLayout', e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {MENU_LAYOUT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('spacing')}</Label>
                <select
                  value={draft.spacing}
                  onChange={(e) => setField('spacing', e.target.value)}
                  className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm"
                >
                  {SPACING_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {t(o.labelKey)}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Section>

          <Section title={t('featuredPlates')} hint={t('featuredHint')}>
            {pinnedPlates.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {pinnedPlates.map(({ item }) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => toggleFeatured(item)}
                    title={t('unpinPlate')}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium hover:bg-primary/20"
                  >
                    <span aria-hidden="true">⭐</span>
                    <span className="max-w-[140px] truncate">
                      {resolveTranslation(item, appLocale).name}
                    </span>
                    <X className="size-3.5 opacity-60" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mb-3">{t('noFeaturedYet')}</p>
            )}
            <div className="relative">
              <Search className="absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              <Input
                value={featuredQuery}
                onChange={(e) => setFeaturedQuery(e.target.value)}
                placeholder={t('searchFeatured')}
                dir="auto"
                className="rounded-full ps-9 pe-9"
              />
              {featuredQuery && (
                <button
                  type="button"
                  onClick={() => setFeaturedQuery('')}
                  aria-label={t('clearSearch')}
                  className="absolute end-2.5 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4" />
                </button>
              )}
            </div>
            <div className="mt-2">
              {searchQuery === '' ? (
                <p className="text-xs text-muted-foreground px-1 py-2">{t('typeToSearch')}</p>
              ) : searchResults.length === 0 ? (
                <p className="text-xs text-muted-foreground px-1 py-2">{t('noPlatesFound')}</p>
              ) : (
                <div className="divide-y divide-border/60 rounded-lg border border-input/60">
                  {searchResults.map(({ item, catName }) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-2 px-3 py-2"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm">
                          {resolveTranslation(item, appLocale).name}
                        </span>
                        <span className="block truncate text-[11px] text-muted-foreground">
                          {catName}
                          {!item.isAvailable && ` · ${t('notAvailable')}`}
                        </span>
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleFeatured(item)}
                        aria-pressed={item.isFeatured}
                        title={item.isFeatured ? t('unpinPlate') : t('pinPlate')}
                        className="shrink-0 rounded-full p-1.5 hover:bg-muted"
                      >
                        <Star
                          className={
                            item.isFeatured
                              ? 'size-4 fill-amber-400 text-amber-400'
                              : 'size-4 text-muted-foreground'
                          }
                        />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {searchQuery !== '' && hiddenCount > 0 && (
                <p className="text-[11px] text-muted-foreground px-1 pt-1.5">
                  {t('moreResults', { count: hiddenCount })}
                </p>
              )}
            </div>
          </Section>

          <MenuQrCode slug={draft.slug} domain={draft.domain} />
        </div>

        <div className="space-y-2 w-full max-w-[390px] mx-auto lg:sticky lg:top-20 lg:self-start">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">{t('preview')}</span>
            <div className="flex gap-1">
              {(['en', 'ar'] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setPreviewLocale(l)}
                  aria-pressed={(previewLocale ?? appLocale) === l}
                  className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${
                    (previewLocale ?? appLocale) === l
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:bg-muted'
                  }`}
                >
                  {l === 'en' ? 'EN' : 'AR'}
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-[2.5rem] border-[6px] border-foreground/80 bg-foreground/80 shadow-2xl overflow-hidden">
            <div
              className="overflow-y-auto overscroll-contain"
              style={{ height: 'min(640px, calc(100svh - 17rem))', background: draft.backgroundColor }}
            >
              {/* Preview scoping: neutralize the production `min-h-dvh` (it would
                  force a viewport-tall page inside the fixed-height phone) and
                  `content-visibility` placeholders (blank bands inside a nested
                  scrollport). Unlayered, so it beats Tailwind's layered utilities. */}
              <style>{`
                #theme-preview { min-height: 100%; display: flow-root; }
                #theme-preview .menu-page { min-height: auto; }
                #theme-preview .menu-category { content-visibility: visible; }
              `}</style>
              <div id="theme-preview" className="pointer-events-none select-none">
                <MenuHome
                  tenant={previewTenant ?? draft}
                  locale={previewLocale ?? appLocale}
                  themeScope="#theme-preview"
                  preview
                />
              </div>
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground text-center">{t('previewHint')}</p>
        </div>
      </div>
    </div>
  );
}
