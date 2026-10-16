/*
  Warnings:

  - A unique constraint covering the columns `[userId,sem,year]` on the table `ScrutinyDuties` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "ScrutinyDuties_userId_sem_year_key" ON "ScrutinyDuties"("userId", "sem", "year");
