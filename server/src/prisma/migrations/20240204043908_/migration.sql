/*
  Warnings:

  - You are about to drop the column `ageProofJSON` on the `User` table. All the data in the column will be lost.

*/
-- AlterSequence
ALTER SEQUENCE "User_id_seq" MAXVALUE 9223372036854775807;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "ageProofJSON";
ALTER TABLE "User" ADD COLUMN     "countryPublicJSON" JSONB;
ALTER TABLE "User" ADD COLUMN     "countryVerificationJSON" JSONB;
