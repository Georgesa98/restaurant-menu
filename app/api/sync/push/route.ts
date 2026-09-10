import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/require-session';

type CategoryUpsert = {
  id: string;
  name?: string;
  slug?: string;
  description?: string | null;
  displayOrder?: number;
  isActive?: boolean;
  translations?: { locale: string; name: string; description?: string | null }[];
};

type ItemUpsert = {
  id: string;
  categoryId?: string;
  name?: string;
  description?: string | null;
  basePrice?: number | string | null;
  imageUrl?: string | null;
  isAvailable?: boolean;
  displayOrder?: number;
  dietaryTags?: string[];
  translations?: { locale: string; name: string; description?: string | null }[];
  variants?: { id?: string; label: string; labelEn?: string; price: number | string; sortOrder?: number }[];
};

/**
 * POST /api/sync/push (auth required, tenant-scoped from session).
 * Last-write-wins: a row the server touched after the tablet's `baseSince`
 * is a conflict (server kept, returned for the tablet to apply).
 */
export async function POST(req: Request) {
  const r = await requireSession();
  if ('response' in r) return r.response;
  const { userTenantId, userRole } = r.session;

  const body = await req.json();
  const tenantId = userRole === 'SUPER_ADMIN' ? body.tenantId : userTenantId;
  if (!tenantId) return Response.json({ error: 'tenantId required' }, { status: 400 });

  const base = new Date(body.baseSince);
  if (isNaN(base.getTime())) return Response.json({ error: 'invalid baseSince' }, { status: 400 });

  const now = new Date();
  const acceptedCategoryIds: string[] = [];
  const acceptedItemIds: string[] = [];
  const conflictCategories: unknown[] = [];
  const conflictItems: unknown[] = [];

  const isConflict = (updatedAt: Date) => updatedAt.getTime() > base.getTime();

  for (const cu of (body.upserts?.categories ?? []) as CategoryUpsert[]) {
    try {
      const existing = await prisma.category.findFirst({
        where: { id: cu.id, tenantId },
        include: { translations: true },
      });
      if (existing && isConflict(existing.updatedAt)) {
        conflictCategories.push(existing);
        continue;
      }
      if (!existing) {
        await prisma.category.create({
          data: {
            id: cu.id,
            tenantId,
            name: cu.name!,
            slug: cu.slug!,
            description: cu.description ?? null,
            displayOrder: cu.displayOrder ?? 0,
            isActive: cu.isActive ?? true,
            isDeleted: false,
            updatedAt: now,
            ...(cu.translations?.length
              ? {
                  translations: {
                    create: cu.translations.map((t) => ({
                      locale: t.locale,
                      name: t.name,
                      description: t.description ?? null,
                    })),
                  },
                }
              : {}),
          },
        });
      } else {
        await prisma.$transaction([
          prisma.category.update({
            where: { id: cu.id },
            data: {
              ...(cu.name !== undefined ? { name: cu.name } : {}),
              ...(cu.slug !== undefined ? { slug: cu.slug } : {}),
              ...(cu.description !== undefined ? { description: cu.description } : {}),
              ...(cu.displayOrder !== undefined ? { displayOrder: cu.displayOrder } : {}),
              ...(cu.isActive !== undefined ? { isActive: cu.isActive } : {}),
              isDeleted: false,
              updatedAt: now,
            },
          }),
          ...(cu.translations ?? []).map((t) =>
            prisma.categoryTranslation.upsert({
              where: { categoryId_locale: { categoryId: cu.id, locale: t.locale } },
              update: { name: t.name, description: t.description ?? null },
              create: { categoryId: cu.id, locale: t.locale, name: t.name, description: t.description ?? null },
            }),
          ),
        ]);
      }
      acceptedCategoryIds.push(cu.id);
    } catch (e) {
      const code = (e as { code?: string })?.code;
      conflictCategories.push({ id: cu.id, error: code === 'P2002' ? 'slug_taken' : 'rejected' });
    }
  }

  for (const iu of (body.upserts?.items ?? []) as ItemUpsert[]) {
    try {
      const existing = await prisma.menuItem.findFirst({
        where: { id: iu.id, tenantId },
        include: { translations: true },
      });
      if (existing && isConflict(existing.updatedAt)) {
        conflictItems.push(existing);
        continue;
      }
      const variantOps =
        iu.variants !== undefined
          ? [
              prisma.menuItemVariant.updateMany({
                where: { menuItemId: iu.id, isDeleted: false },
                data: { isDeleted: true },
              }),
              ...iu.variants.map((v, i) =>
                prisma.menuItemVariant.create({
                  data: {
                    id: v.id ?? `${iu.id}-v${i}-${Date.now()}`,
                    menuItemId: iu.id,
                    label: v.label,
                    labelEn: v.labelEn ?? v.label,
                    price: v.price,
                    sortOrder: v.sortOrder ?? i,
                    isDeleted: false,
                  },
                }),
              ),
            ]
          : [];
      const translationOps = (iu.translations ?? []).map((t) =>
        prisma.menuItemTranslation.upsert({
          where: { menuItemId_locale: { menuItemId: iu.id, locale: t.locale } },
          update: { name: t.name, description: t.description ?? null },
          create: { menuItemId: iu.id, locale: t.locale, name: t.name, description: t.description ?? null },
        }),
      );
      if (!existing) {
        await prisma.$transaction([
          prisma.menuItem.create({
            data: {
              id: iu.id,
              tenantId,
              categoryId: iu.categoryId!,
              name: iu.name!,
              description: iu.description ?? null,
              basePrice: iu.basePrice ?? null,
              imageUrl: iu.imageUrl ?? null,
              isAvailable: iu.isAvailable ?? true,
              displayOrder: iu.displayOrder ?? 0,
              dietaryTags: iu.dietaryTags ?? [],
              isDeleted: false,
              updatedAt: now,
            },
          }),
          ...translationOps,
          ...variantOps,
        ]);
      } else {
        await prisma.$transaction([
          prisma.menuItem.update({
            where: { id: iu.id },
            data: {
              ...(iu.categoryId !== undefined ? { categoryId: iu.categoryId } : {}),
              ...(iu.name !== undefined ? { name: iu.name } : {}),
              ...(iu.description !== undefined ? { description: iu.description } : {}),
              ...(iu.basePrice !== undefined ? { basePrice: iu.basePrice } : {}),
              ...(iu.imageUrl !== undefined ? { imageUrl: iu.imageUrl } : {}),
              ...(iu.isAvailable !== undefined ? { isAvailable: iu.isAvailable } : {}),
              ...(iu.displayOrder !== undefined ? { displayOrder: iu.displayOrder } : {}),
              ...(iu.dietaryTags !== undefined ? { dietaryTags: iu.dietaryTags } : {}),
              isDeleted: false,
              updatedAt: now,
            },
          }),
          ...translationOps,
          ...variantOps,
        ]);
      }
      acceptedItemIds.push(iu.id);
    } catch {
      conflictItems.push({ id: iu.id, error: 'rejected' });
    }
  }

  for (const id of (body.deletes?.categoryIds ?? []) as string[]) {
    await prisma.$transaction([
      prisma.category.updateMany({
        where: { id, tenantId },
        data: { isDeleted: true, updatedAt: now },
      }),
      prisma.menuItem.updateMany({
        where: { categoryId: id, tenantId, isDeleted: false },
        data: { isDeleted: true, updatedAt: now },
      }),
    ]);
  }
  for (const id of (body.deletes?.itemIds ?? []) as string[]) {
    await prisma.menuItem.updateMany({
      where: { id, tenantId },
      data: { isDeleted: true, updatedAt: now },
    });
  }
  for (const id of (body.deletes?.variantIds ?? []) as string[]) {
    const v = await prisma.menuItemVariant.findUnique({
      where: { id },
      include: { menuItem: { select: { tenantId: true, id: true } } },
    });
    if (v && v.menuItem.tenantId === tenantId) {
      await prisma.$transaction([
        prisma.menuItemVariant.update({ where: { id }, data: { isDeleted: true } }),
        prisma.menuItem.update({ where: { id: v.menuItem.id }, data: { updatedAt: now } }),
      ]);
    }
  }

  return Response.json({
    serverTime: now.toISOString(),
    accepted: { categoryIds: acceptedCategoryIds, itemIds: acceptedItemIds },
    conflicts: { categories: conflictCategories, items: conflictItems },
  });
}
