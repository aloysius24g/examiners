/*
  Warnings:

  - You are about to drop the column `ownerUserId` on the `IdCardImage` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "IdCardImage" DROP CONSTRAINT "IdCardImage_ownerUserId_fkey";

-- AlterTable
ALTER TABLE "IdCardImage" DROP COLUMN "ownerUserId";
