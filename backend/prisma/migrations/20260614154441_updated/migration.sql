/*
  Warnings:

  - You are about to drop the column `idCardImage` on the `TsUser` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[idCardImageFileName]` on the table `CollegeWorked` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `idCardImageFileName` to the `CollegeWorked` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CollegeWorked" ADD COLUMN     "idCardImageFileName" VARCHAR NOT NULL;

-- AlterTable
ALTER TABLE "TsUser" DROP COLUMN "idCardImage";

-- CreateTable
CREATE TABLE "IdCardImage" (
    "fileName" VARCHAR NOT NULL,
    "ownerUserId" INTEGER NOT NULL,

    CONSTRAINT "IdCardImage_pkey" PRIMARY KEY ("fileName")
);

-- CreateIndex
CREATE INDEX "IdCardImage_fileName_idx" ON "IdCardImage"("fileName");

-- CreateIndex
CREATE UNIQUE INDEX "CollegeWorked_idCardImageFileName_key" ON "CollegeWorked"("idCardImageFileName");

-- AddForeignKey
ALTER TABLE "CollegeWorked" ADD CONSTRAINT "CollegeWorked_idCardImageFileName_fkey" FOREIGN KEY ("idCardImageFileName") REFERENCES "IdCardImage"("fileName") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdCardImage" ADD CONSTRAINT "IdCardImage_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
