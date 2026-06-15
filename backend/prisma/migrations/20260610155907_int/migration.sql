-- CreateEnum
CREATE TYPE "AccountType" AS ENUM ('ITS', 'ETS', 'NS');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "passHash" CHAR(60) NOT NULL,
    "active" BOOLEAN NOT NULL,
    "firstName" VARCHAR(30) NOT NULL,
    "LastName" VARCHAR(30) NOT NULL,
    "salutation" VARCHAR(5) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NsUser" (
    "userId" INTEGER NOT NULL,
    "userName" VARCHAR(30) NOT NULL,
    "roleName" VARCHAR(50) NOT NULL,

    CONSTRAINT "NsUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "TsUser" (
    "userId" INTEGER NOT NULL,
    "aicteNo" CHAR(12) NOT NULL,
    "annaUnivNo" CHAR(12) NOT NULL,
    "designation" VARCHAR(30) NOT NULL,
    "department" VARCHAR(60) NOT NULL,
    "collegeName" VARCHAR(200) NOT NULL,
    "collegePlace" VARCHAR(30) NOT NULL,
    "yearOfExperience" INTEGER NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "phone" VARCHAR(15) NOT NULL,
    "emailVerified" BOOLEAN NOT NULL,
    "userVerified" BOOLEAN NOT NULL,

    CONSTRAINT "TsUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Preference" (
    "userId" INTEGER NOT NULL,
    "preferred" VARCHAR(20) NOT NULL,

    CONSTRAINT "Preference_pkey" PRIMARY KEY ("userId","preferred")
);

-- CreateTable
CREATE TABLE "TheoryHandled" (
    "userId" INTEGER NOT NULL,
    "courseCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "TheoryHandled_pkey" PRIMARY KEY ("userId","courseCode")
);

-- CreateTable
CREATE TABLE "PracticalHandled" (
    "userId" INTEGER NOT NULL,
    "courseCode" VARCHAR(10) NOT NULL,

    CONSTRAINT "PracticalHandled_pkey" PRIMARY KEY ("userId","courseCode")
);

-- CreateIndex
CREATE UNIQUE INDEX "NsUser_userId_key" ON "NsUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TsUser_userId_key" ON "TsUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "TsUser_aicteNo_key" ON "TsUser"("aicteNo");

-- CreateIndex
CREATE UNIQUE INDEX "TsUser_annaUnivNo_key" ON "TsUser"("annaUnivNo");

-- AddForeignKey
ALTER TABLE "NsUser" ADD CONSTRAINT "NsUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TsUser" ADD CONSTRAINT "TsUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preference" ADD CONSTRAINT "Preference_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TheoryHandled" ADD CONSTRAINT "TheoryHandled_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticalHandled" ADD CONSTRAINT "PracticalHandled_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
