import { prisma } from '@/lib/prisma';

/**
 * POST /api/devices/heartbeat (public, kiosk).
 * Body: { slug | tenantId, deviceId, appVersion?, locale? }
 * Upserts the per-device row and returns the tenant's current
 * revision + poll flag so the tablet can decide to re-pull.
 */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: 'invalid body' }, { status: 400 });

  const { slug, tenantId: tenantIdRaw, deviceId, appVersion, locale, knownRevision } = body as {
    slug?: string;
    tenantId?: string;
    deviceId?: string;
    appVersion?: string;
    locale?: string;
    knownRevision?: number;
  };
  if ((!slug && !tenantIdRaw) || !deviceId || typeof deviceId !== 'string') {
    return Response.json({ error: 'slug|tenantId + deviceId required' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: slug ? { slug } : { id: tenantIdRaw! },
    select: { id: true, isActive: true, revision: true, syncRequired: true },
  });
  if (!tenant || !tenant.isActive) {
    return Response.json({ error: 'unknown tenant' }, { status: 404 });
  }

  await prisma.deviceHeartbeat.upsert({
    where: { tenantId_deviceId: { tenantId: tenant.id, deviceId } },
    update: {
      lastSeen: new Date(),
      ...(appVersion !== undefined ? { appVersion: String(appVersion).slice(0, 64) } : {}),
      ...(locale !== undefined ? { locale: String(locale).slice(0, 16) } : {}),
    },
    create: {
      tenantId: tenant.id,
      deviceId,
      appVersion: appVersion !== undefined ? String(appVersion).slice(0, 64) : null,
      locale: locale !== undefined ? String(locale).slice(0, 16) : null,
    },
  });

  // Fleet caught up → auto-clear the poll flag. A concurrent write may
  // re-raise it right after; that is correct (there is newer work).
  let syncRequired = tenant.syncRequired;
  if (
    syncRequired &&
    typeof knownRevision === 'number' &&
    Number.isFinite(knownRevision) &&
    knownRevision >= tenant.revision
  ) {
    const cleared = await prisma.tenant.update({
      where: { id: tenant.id },
      data: { syncRequired: false },
      select: { syncRequired: true },
    });
    syncRequired = cleared.syncRequired;
  }

  return Response.json({
    serverTime: new Date().toISOString(),
    revision: tenant.revision,
    syncRequired,
  });
}
