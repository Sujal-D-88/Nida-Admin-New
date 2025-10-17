/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `SportRegistration` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."SportRegistration" ADD COLUMN     "userId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "SportRegistration_userId_key" ON "public"."SportRegistration"("userId");
