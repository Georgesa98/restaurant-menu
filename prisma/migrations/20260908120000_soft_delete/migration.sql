-- Soft-delete flags for delta sync (docs/PLAN.md §18).
-- Deletes set isDeleted=true instead of removing rows; sync ships flagged
-- rows as tombstones. Existing rows default to false (visible, unchanged).

ALTER TABLE "categories" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "menu_items" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "menu_item_variants" ADD COLUMN "isDeleted" BOOLEAN NOT NULL DEFAULT false;
