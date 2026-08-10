-- CreateTable
CREATE TABLE "OwnPreference" (
    "userId" INTEGER NOT NULL,
    "preferredFor" "ExaminerRole" NOT NULL,

    CONSTRAINT "OwnPreference_pkey" PRIMARY KEY ("userId","preferredFor")
);

-- AddForeignKey
ALTER TABLE "OwnPreference" ADD CONSTRAINT "OwnPreference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TsUser"("userId") ON DELETE RESTRICT ON UPDATE CASCADE;
