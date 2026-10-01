'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { getTenantDevices } from '@/service';

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

export function FleetPanel({ tenants }: { tenants: { id: string; name: string }[] }) {
  const t = useTranslations('admin');
  const [devices, setDevices] = useState<Device[]>([]);
  const [fleetTenant, setFleetTenant] = useState('');
  const [fleetLoading, setFleetLoading] = useState(false);
  const [fleetNow, setFleetNow] = useState(() => Date.now());

  useEffect(() => {
    setFleetTenant((prev) => prev || tenants[0]?.id || '');
  }, [tenants]);

  useEffect(() => {
    if (!fleetTenant) {
      setDevices([]);
      return;
    }
    setFleetLoading(true);
    (async () => {
      try {
        setDevices(await getTenantDevices(fleetTenant));
        setFleetNow(Date.now());
      } catch {
        setDevices([]);
      } finally {
        setFleetLoading(false);
      }
    })();
  }, [fleetTenant, tenants]);

  return (
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
  );
}
