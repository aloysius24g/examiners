-- CreateTable
CREATE TABLE "ScrutinyDuties" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "sem" "Sem" NOT NULL,
    "year" CHAR(4) NOT NULL,
    "questionCount" INTEGER NOT NULL,

    CONSTRAINT "ScrutinyDuties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticalDuties" (
    "id" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "sem" "Sem" NOT NULL,
    "year" CHAR(4) NOT NULL,
    "courseCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "PracticalDuties_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ScrutinyDuties" ADD CONSTRAINT "ScrutinyDuties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticalDuties" ADD CONSTRAINT "PracticalDuties_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
