/*
  Warnings:

  - A unique constraint covering the columns `[userName]` on the table `NsUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "NsUser_userName_key" ON "NsUser"("userName");
