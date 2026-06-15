-- AlterTable
ALTER TABLE "TsUser" ADD COLUMN     "coursesLastUpdated" TIMESTAMPTZ(3);

-- AlterTable
ALTER TABLE "User" ALTER COLUMN "createdAt" SET DATA TYPE TIMESTAMPTZ(3),
ALTER COLUMN "updatedAt" SET DATA TYPE TIMESTAMPTZ(3);

-- CreateIndex
CREATE INDEX "NsUser_userId_idx" ON "NsUser"("userId");

-- CreateIndex
CREATE INDEX "TsUser_userId_idx" ON "TsUser"("userId");

-- CreateIndex
CREATE INDEX "User_id_idx" ON "User"("id");
