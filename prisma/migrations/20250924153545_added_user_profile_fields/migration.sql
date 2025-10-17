/*
  Warnings:

  - A unique constraint covering the columns `[memberId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "hasPaperOrPoster" BOOLEAN DEFAULT false,
ADD COLUMN     "isMember" BOOLEAN DEFAULT false,
ADD COLUMN     "memberId" TEXT,
ADD COLUMN     "workshops" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "public"."User"("memberId");
