/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `TsUser` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[phone]` on the table `TsUser` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TsUser_email_key" ON "TsUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TsUser_phone_key" ON "TsUser"("phone");
