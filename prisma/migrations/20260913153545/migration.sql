/*
  Warnings:

  - You are about to drop the column `financialPrice` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `imageCard` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `imageFull` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `imageThumbnail` on the `menu_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "financialPrice",
DROP COLUMN "imageCard",
DROP COLUMN "imageFull",
DROP COLUMN "imageThumbnail",
ADD COLUMN     "imageUrl" TEXT;
