/*
  Warnings:

  - You are about to drop the column `photo` on the `User` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[transactionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payuId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "photo",
ADD COLUMN     "paymentAmount" DOUBLE PRECISION,
ADD COLUMN     "paymentStatus" TEXT,
ADD COLUMN     "payuId" TEXT,
ADD COLUMN     "transactionId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "mobile" DROP NOT NULL,
ALTER COLUMN "address" DROP NOT NULL,
ALTER COLUMN "registrationType" DROP NOT NULL,
ALTER COLUMN "memberType" DROP NOT NULL,
ALTER COLUMN "subCategory" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "User_transactionId_key" ON "public"."User"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "User_payuId_key" ON "public"."User"("payuId");
