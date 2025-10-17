-- CreateTable
CREATE TABLE "public"."MemberCounter" (
    "id" TEXT NOT NULL DEFAULT 'member_counter',
    "value" INTEGER NOT NULL DEFAULT 1000,

    CONSTRAINT "MemberCounter_pkey" PRIMARY KEY ("id")
);
