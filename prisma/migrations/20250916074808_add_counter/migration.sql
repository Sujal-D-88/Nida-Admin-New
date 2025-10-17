-- CreateTable
CREATE TABLE "public"."Counter" (
    "id" TEXT NOT NULL DEFAULT 'user_counter',
    "value" INTEGER NOT NULL DEFAULT 99,

    CONSTRAINT "Counter_pkey" PRIMARY KEY ("id")
);
