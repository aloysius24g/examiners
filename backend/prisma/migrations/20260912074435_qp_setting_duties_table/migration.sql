-- CreateTable
CREATE TABLE "QPSettingDuties" (
    "userId" INTEGER NOT NULL,
    "sem" VARCHAR(30) NOT NULL,
    "year" CHAR(4) NOT NULL,
    "count" INTEGER NOT NULL,

    CONSTRAINT "QPSettingDuties_pkey" PRIMARY KEY ("userId","sem","year")
);

-- AddForeignKey
ALTER TABLE "QPSettingDuties" ADD CONSTRAINT "QPSettingDuties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
