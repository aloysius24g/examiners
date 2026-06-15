/*
  Warnings:

  - Added the required column `idCardImage` to the `TsUser` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TsUser" ADD COLUMN     "idCardImage" VARCHAR NOT NULL;
