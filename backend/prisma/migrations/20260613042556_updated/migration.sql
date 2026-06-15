/*
  Warnings:

  - The values [ITS,ETS] on the enum `AccountType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `LastName` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `firstName` on the `User` table. All the data in the column will be lost.
  - Added the required column `collegePinCode` to the `TsUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `internal` to the `TsUser` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "AccountType_new" AS ENUM ('TS', 'NS');
ALTER TABLE "User" ALTER COLUMN "accountType" TYPE "AccountType_new" USING ("accountType"::text::"AccountType_new");
ALTER TYPE "AccountType" RENAME TO "AccountType_old";
ALTER TYPE "AccountType_new" RENAME TO "AccountType";
DROP TYPE "public"."AccountType_old";
COMMIT;

-- AlterTable
ALTER TABLE "TsUser" ADD COLUMN     "collegePinCode" CHAR(6) NOT NULL,
ADD COLUMN     "internal" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "LastName",
DROP COLUMN "firstName",
ADD COLUMN     "name" VARCHAR(50) NOT NULL,
ALTER COLUMN "active" SET DEFAULT true;
