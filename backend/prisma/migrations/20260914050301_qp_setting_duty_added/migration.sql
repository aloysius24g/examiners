/*
  Warnings:

  - The primary key for the `QPSettingDuties` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `count` on the `QPSettingDuties` table. All the data in the column will be lost.
  - Added the required column `courseCode` to the `QPSettingDuties` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `QPSettingDuties` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.
  - Changed the type of `sem` on the `QPSettingDuties` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "Sem" AS ENUM ('odd', 'even');

-- AlterTable
ALTER TABLE "QPSettingDuties" DROP CONSTRAINT "QPSettingDuties_pkey",
DROP COLUMN "count",
ADD COLUMN     "courseCode" VARCHAR(10) NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
DROP COLUMN "sem",
ADD COLUMN     "sem" "Sem" NOT NULL,
ADD CONSTRAINT "QPSettingDuties_pkey" PRIMARY KEY ("id");
