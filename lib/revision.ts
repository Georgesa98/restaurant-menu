import { prisma } from './prisma';

/**
 * Bump a tenant's menu revision + raise the poll-flag.
 * Call after every accepted menu write (admin CRUD, import, tablet push)
 * so tablets can compare `revision` cheaply instead of scanning timestamps.
 * Best-effort: revision must never fail the write itself.
 */
export async function bumpTenantRevision(tenantId: string): Promise<void> {
  try {
    await prisma.tenant.update({
      where: { id: tenantId },
      data: { revision: { increment: 1 }, syncRequired: true },
    });
  } catch {
    // Swallowed — the menu write already succeeded.
  }
}
