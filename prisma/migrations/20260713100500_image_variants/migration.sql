/*
  Warnings:

  - You are about to drop the column `imageUrl` on the `menu_items` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "imageUrl",
ADD COLUMN     "imageCard" TEXT,
ADD COLUMN     "imageFull" TEXT,
ADD COLUMN     "imageThumbnail" TEXT;
