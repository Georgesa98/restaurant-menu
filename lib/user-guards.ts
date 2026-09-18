import { prisma } from './prisma';
import type { Session } from './require-session';

export const forbid = () => Response.json({ error: 'Forbidden' }, { status: 403 });

/** Null when the caller is super-admin, otherwise the 403 to return. */
export function requireSuper(session: Session): Response | null {
  return session.userRole === 'SUPER_ADMIN' ? null : forbid();
}

type DemoteIntent = {
  targetId: string;
  /** Role being assigned, if the call changes the role. */
  nextRole?: string | null;
  /** Active flag being assigned, if the call changes it. */
  nextActive?: boolean | null;
  /** True for hard delete. */
  hardDelete?: boolean;
};

/**
 * Guards against locking everyone out: no self-demote/deactivate/delete,
 * and never remove the last active super-admin. Returns the error response
 * to return, or null when the operation may proceed.
 */
export async function guardSuperAdminChange(
  actorId: string,
  intent: DemoteIntent,
): Promise<Response | null> {
  const target = await prisma.user.findUnique({
    where: { id: intent.targetId },
    select: { role: true, isActive: true },
  });
  if (!target) return Response.json({ error: 'Not found' }, { status: 404 });

  const demotes =
    (intent.nextRole !== undefined && intent.nextRole !== null && intent.nextRole !== 'SUPER_ADMIN' && target.role === 'SUPER_ADMIN') ||
    (intent.nextActive === false && target.role === 'SUPER_ADMIN') ||
    (intent.hardDelete === true && target.role === 'SUPER_ADMIN');

  if (!demotes) return null;

  if (intent.targetId === actorId) {
    return Response.json({ error: 'You cannot remove your own super-admin access' }, { status: 400 });
  }
  const others = await prisma.user.count({
    where: { role: 'SUPER_ADMIN', isActive: true, id: { not: intent.targetId } },
  });
  if (others === 0) {
    return Response.json({ error: 'Cannot remove the last active super-admin' }, { status: 400 });
  }
  return null;
}
