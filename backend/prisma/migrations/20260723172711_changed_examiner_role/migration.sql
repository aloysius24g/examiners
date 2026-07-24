/*
  Warnings:

  - The values [hallSuperintendent,reviewer] on the enum `ExaminerRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ExaminerRole_new" AS ENUM ('questionScrutinizer', 'questionSetter', 'examinerPractical', 'examinerValuation');
ALTER TABLE "Preference" ALTER COLUMN "preferredFor" TYPE "ExaminerRole_new" USING ("preferredFor"::text::"ExaminerRole_new");
ALTER TYPE "ExaminerRole" RENAME TO "ExaminerRole_old";
ALTER TYPE "ExaminerRole_new" RENAME TO "ExaminerRole";
DROP TYPE "public"."ExaminerRole_old";
COMMIT;
