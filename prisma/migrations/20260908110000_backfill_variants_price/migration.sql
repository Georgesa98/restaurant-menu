-- Backfill schema pieces that were applied via `db push` and never recorded
-- as migrations. Must run BEFORE 20260908120000_soft_delete, which alters
-- `menu_item_variants`.
--
-- 1. `menu_item_variants` table (added via db push in "MenuItemVariant model",
--    `labelEn` added the same way).
-- 2. `menu_items.price` -> nullable `basePrice` rename (was NOT NULL `price`).
-- 3. `tenants.slug` became optional.

-- CreateTable
CREATE TABLE "menu_item_variants" (
    "id" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "label" TEXT NOT NULL,
    "labelEn" TEXT NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "menu_item_variants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "menu_item_variants_menuItemId_idx" ON "menu_item_variants"("menuItemId");

-- AddForeignKey
ALTER TABLE "menu_item_variants" ADD CONSTRAINT "menu_item_variants_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable
ALTER TABLE "menu_items" RENAME COLUMN "price" TO "basePrice";
ALTER TABLE "menu_items" ALTER COLUMN "basePrice" DROP NOT NULL;

-- AlterTable
ALTER TABLE "tenants" ALTER COLUMN "slug" DROP NOT NULL;
