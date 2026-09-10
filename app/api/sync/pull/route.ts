import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

// Tombstones older than this force a full re-pull.
const STALE_CURSOR_DAYS = 30;

/**
 * GET /api/sync/pull?slug=&tenantId=&since=ISO
 * Public (kiosk). First fetch omits `since` for a full dump; later polls send
 * `lastPullAt` and get only changed rows + tombstones. Children always ship
 * as the parent's complete current set — tablets replace them wholesale, so
 * translation/variant removals propagate without child tombstones.
 * Decimal prices serialize as strings (Prisma Decimal.toJSON).
 */
export async function GET(req: Request) {
  const search = new URL(req.url).searchParams;
  const slug = search.get('slug');
  const tenantIdQuery = search.get('tenantId');
  const sinceRaw = search.get('since');

  if (!slug && !tenantIdQuery) {
    return Response.json({ error: 'slug or tenantId required' }, { status: 400 });
  }

  const tenant = await prisma.tenant.findUnique({
    where: slug ? { slug } : { id: tenantIdQuery! },
  });
  if (!tenant || !tenant.isActive) {
    return Response.json({ error: 'unknown tenant' }, { status: 404 });
  }

  const serverTime = new Date();
  let since: Date | null = null;
  if (sinceRaw) {
    since = new Date(sinceRaw);
    if (isNaN(since.getTime())) return Response.json({ error: 'invalid since' }, { status: 400 });
    if (serverTime.getTime() - since.getTime() > STALE_CURSOR_DAYS * 86400_000) {
      return Response.json(
        { error: 'stale_cursor', serverTime: serverTime.toISOString() },
        { status: 410 },
      );
    }
  }

  const changed = since ? { updatedAt: { gt: since } } : {};

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { tenantId: tenant.id, ...changed },
      include: { translations: true },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    }),
    prisma.menuItem.findMany({
      where: { tenantId: tenant.id, ...changed },
      include: {
        translations: true,
        variants: {
          where: { isDeleted: false },
          orderBy: { sortOrder: 'asc' },
        },
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    }),
  ]);

  return Response.json({
    serverTime: serverTime.toISOString(),
    tenant,
    categories,
    items,
  });
}
