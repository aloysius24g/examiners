/*
  Warnings:

  - The primary key for the `PracticalHandled` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `Preference` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `preferred` on the `Preference` table. All the data in the column will be lost.
  - The primary key for the `TheoryHandled` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `collegeName` on the `TsUser` table. All the data in the column will be lost.
  - You are about to drop the column `collegePinCode` on the `TsUser` table. All the data in the column will be lost.
  - You are about to drop the column `collegePlace` on the `TsUser` table. All the data in the column will be lost.
  - You are about to drop the column `designation` on the `TsUser` table. All the data in the column will be lost.
  - Added the required column `chosenTime` to the `PracticalHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseTitle` to the `PracticalHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `preferredFor` to the `Preference` table without a default value. This is not possible if the table is not empty.
  - Added the required column `chosenTime` to the `TheoryHandled` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseTitle` to the `TheoryHandled` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExaminerRole" AS ENUM ('questionScrutinizer', 'questionSetter', 'hallSuperintendent', 'reviewer');

-- DropForeignKey
ALTER TABLE "PracticalHandled" DROP CONSTRAINT "PracticalHandled_userId_fkey";

-- DropForeignKey
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_userId_fkey";

-- DropForeignKey
ALTER TABLE "TheoryHandled" DROP CONSTRAINT "TheoryHandled_userId_fkey";

-- AlterTable
ALTER TABLE "PracticalHandled" DROP CONSTRAINT "PracticalHandled_pkey",
ADD COLUMN     "chosenTime" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "courseTitle" VARCHAR NOT NULL,
ADD CONSTRAINT "PracticalHandled_pkey" PRIMARY KEY ("userId", "courseCode", "chosenTime");

-- AlterTable
ALTER TABLE "Preference" DROP CONSTRAINT "Preference_pkey",
DROP COLUMN "preferred",
ADD COLUMN     "preferredFor" "ExaminerRole" NOT NULL,
ADD CONSTRAINT "Preference_pkey" PRIMARY KEY ("userId", "preferredFor");

-- AlterTable
ALTER TABLE "TheoryHandled" DROP CONSTRAINT "TheoryHandled_pkey",
ADD COLUMN     "chosenTime" TIMESTAMPTZ(3) NOT NULL,
ADD COLUMN     "courseTitle" VARCHAR NOT NULL,
ADD CONSTRAINT "TheoryHandled_pkey" PRIMARY KEY ("userId", "courseCode", "chosenTime");

-- AlterTable
ALTER TABLE "TsUser" DROP COLUMN "collegeName",
DROP COLUMN "collegePinCode",
DROP COLUMN "collegePlace",
DROP COLUMN "designation",
ADD COLUMN     "hasUnVerifiedUpdate" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phoneVerified" BOOLEAN NOT NULL DEFAULT false,
ALTER COLUMN "emailVerified" SET DEFAULT false;

-- CreateTable
CREATE TABLE "CollegeWorked" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "designation" VARCHAR(30) NOT NULL,
    "collegeName" VARCHAR(200) NOT NULL,
    "collegePlace" VARCHAR(30) NOT NULL,
    "collegePinCode" CHAR(6) NOT NULL,
    "recordedAt" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "CollegeWorked_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CollegeWorked_userId_idx" ON "CollegeWorked"("userId");

-- CreateIndex
CREATE INDEX "PracticalHandled_courseCode_idx" ON "PracticalHandled"("courseCode");

-- CreateIndex
CREATE INDEX "TheoryHandled_courseCode_idx" ON "TheoryHandled"("courseCode");

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryHandled" ADD CONSTRAINT "TheoryHandled_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticalHandled" ADD CONSTRAINT "PracticalHandled_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CollegeWorked" ADD CONSTRAINT "CollegeWorked_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
