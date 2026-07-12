/*
  Warnings:

  - You are about to drop the column `borderRadius` on the `tenants` table. All the data in the column will be lost.
  - You are about to drop the column `fontFamily` on the `tenants` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "tenants" DROP COLUMN "borderRadius",
DROP COLUMN "fontFamily",
ADD COLUMN     "availableLocales" TEXT[] DEFAULT ARRAY['en']::TEXT[],
ADD COLUMN     "bodyFont" TEXT NOT NULL DEFAULT 'Inter, system-ui, sans-serif',
ADD COLUMN     "borderRadiusLg" TEXT NOT NULL DEFAULT '16px',
ADD COLUMN     "borderRadiusMd" TEXT NOT NULL DEFAULT '8px',
ADD COLUMN     "borderRadiusSm" TEXT NOT NULL DEFAULT '4px',
ADD COLUMN     "cardStyle" TEXT NOT NULL DEFAULT 'elevated',
ADD COLUMN     "customCss" TEXT,
ADD COLUMN     "defaultLocale" TEXT NOT NULL DEFAULT 'en',
ADD COLUMN     "headingFont" TEXT NOT NULL DEFAULT 'Georgia, serif',
ADD COLUMN     "menuLayout" TEXT NOT NULL DEFAULT 'single',
ADD COLUMN     "shadow" TEXT NOT NULL DEFAULT '0 2px 8px rgba(0,0,0,0.08)',
ADD COLUMN     "spacing" TEXT NOT NULL DEFAULT 'comfortable',
ADD COLUMN     "surfaceColor" TEXT NOT NULL DEFAULT '#ffffff',
ADD COLUMN     "textColor" TEXT NOT NULL DEFAULT '#1a1a2e',
ADD COLUMN     "textMuted" TEXT NOT NULL DEFAULT '#64748b';

-- CreateTable
CREATE TABLE "category_translations" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "category_translations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "menu_item_translations" (
    "id" UUID NOT NULL,
    "menuItemId" UUID NOT NULL,
    "locale" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,

    CONSTRAINT "menu_item_translations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "category_translations_categoryId_locale_key" ON "category_translations"("categoryId", "locale");

-- CreateIndex
CREATE UNIQUE INDEX "menu_item_translations_menuItemId_locale_key" ON "menu_item_translations"("menuItemId", "locale");

-- AddForeignKey
ALTER TABLE "category_translations" ADD CONSTRAINT "category_translations_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_item_translations" ADD CONSTRAINT "menu_item_translations_menuItemId_fkey" FOREIGN KEY ("menuItemId") REFERENCES "menu_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
