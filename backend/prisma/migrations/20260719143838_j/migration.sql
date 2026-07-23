/*
  Warnings:

  - You are about to drop the column `coursesLastUpdated` on the `TsUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "TsUser" DROP COLUMN "coursesLastUpdated",
ADD COLUMN     "practicalCoursesLastUpdated" TIMESTAMPTZ(3),
ADD COLUMN     "theoryCoursesLastUpdated" TIMESTAMPTZ(3);
