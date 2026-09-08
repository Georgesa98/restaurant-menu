-- One-time backfill: rewrite relative /uploads/... image URLs left over from
-- the Hono proxy era to absolute public S3 URLs (direct-S3 decision, 2026-09-08).
-- Run manually with psql AFTER STORAGE_PUBLIC_BASE_URL is live and the bucket
-- is public-read. Safe to re-run (only touches rows still starting with /uploads/).

UPDATE menu_items
   SET "imageUrl" = 'https://s3-menu.georgesalebe.me/menu-media' || "imageUrl",
       "updatedAt" = NOW()
 WHERE "imageUrl" LIKE '/uploads/%';

UPDATE tenants
   SET "logoUrl" = 'https://s3-menu.georgesalebe.me/menu-media' || "logoUrl",
       "updatedAt" = NOW()
 WHERE "logoUrl" LIKE '/uploads/%';

UPDATE tenants
   SET "coverUrl" = 'https://s3-menu.georgesalebe.me/menu-media' || "coverUrl",
       "updatedAt" = NOW()
 WHERE "coverUrl" LIKE '/uploads/%';
