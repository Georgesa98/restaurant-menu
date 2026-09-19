'use client';

import { ClipboardList } from 'lucide-react';
import type { TenantData } from '@/lib/types';
import { LanguageSwitcher } from './language-switcher';

/** Guest-list notice: the in-app list is not sent to the kitchen. */
export function ViewingNotice({ text, isRtl }: { text: string; isRtl: boolean }) {
  return (
    <div className="mx-auto px-4 pt-3" style={{ maxWidth: '900px' }}>
      <p
        className="flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-center"
        style={{
          background: '#F6F1E7',
          border: '0.5px solid #E4DDCF',
          color: 'var(--text-muted)',
        }}
        dir={isRtl ? 'rtl' : 'ltr'}
      >
        <ClipboardList size={14} strokeWidth={1.9} style={{ color: 'var(--primary)', flexShrink: 0 }} />
        {text}
      </p>
    </div>
  );
}

/** Kiosk hero (logo/name, description, address/phone) + dish search field. */
export function MenuHero({
  tenant,
  locale,
  isRtl,
  query,
  onQueryChange,
  searchPlaceholder,
  clearLabel,
  notice,
}: {
  tenant: TenantData;
  locale: string;
  isRtl: boolean;
  query: string;
  onQueryChange: (q: string) => void;
  searchPlaceholder: string;
  clearLabel: string;
  notice: string;
}) {
  return (
    <>
      <header className="relative text-center px-4 pt-8 pb-6" style={{ background: 'var(--bg)' }}>
        <div className={`absolute top-4 ${isRtl ? 'left-4' : 'right-4'}`}>
          <LanguageSwitcher locale={locale} />
        </div>

        {tenant.logoUrl ? (
          <img
            src={tenant.logoUrl}
            alt="Valley Star"
            className="h-16 mx-auto mb-4 object-contain"
          />
        ) : (
          <>
            <span className="menu-eyebrow block mb-2">Restaurant</span>
            <h1
              className="text-[48px] sm:text-5xl leading-none mb-3"
              style={{
                fontFamily: 'var(--font-script)',
                color: 'var(--primary)',
              }}
            >
              Valley Star
            </h1>
          </>
        )}

        {tenant.description && (
          <p className="text-sm mt-2" style={{ color: 'var(--text-muted)' }}>
            {tenant.description}
          </p>
        )}

        {(tenant.address || tenant.phone) && (
          <div className="mt-3 text-xs space-y-1" style={{ color: 'var(--text-muted)' }}>
            {tenant.address && <p>{tenant.address}</p>}
            {tenant.phone && <p>{tenant.phone}</p>}
          </div>
        )}
      </header>

      <ViewingNotice text={notice} isRtl={isRtl} />

      <MenuSearchField
        query={query}
        onQueryChange={onQueryChange}
        searchPlaceholder={searchPlaceholder}
        clearLabel={clearLabel}
        isRtl={isRtl}
      />
    </>
  );
}

export function MenuSearchField({
  query,
  onQueryChange,
  searchPlaceholder,
  clearLabel,
  isRtl,
}: {
  query: string;
  onQueryChange: (q: string) => void;
  searchPlaceholder: string;
  clearLabel: string;
  isRtl: boolean;
}) {
  return (
    <div className="mx-auto px-4 pt-4" style={{ maxWidth: '900px' }}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="w-full rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ border: '0.5px solid #E4DDCF', background: '#fff' }}
        />
        {query && (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            aria-label={clearLabel}
            className="absolute top-1/2 -translate-y-1/2 text-lg leading-none"
            style={{ [isRtl ? 'left' : 'right']: '12px', color: 'var(--text-muted)' }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
}
