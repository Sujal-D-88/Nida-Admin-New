-- CreateTable
CREATE TABLE "public"."SportRegistration" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "age" INTEGER NOT NULL,
    "mobile" TEXT NOT NULL,
    "gender" TEXT NOT NULL,
    "tshirtSize" TEXT NOT NULL,
    "memberType" TEXT NOT NULL,
    "selectedSports" TEXT[],
    "totalPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "transactionId" TEXT,
    "payuId" TEXT,
    "paymentStatus" TEXT,

    CONSTRAINT "SportRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SportRegistration_transactionId_key" ON "public"."SportRegistration"("transactionId");

-- CreateIndex
CREATE UNIQUE INDEX "SportRegistration_payuId_key" ON "public"."SportRegistration"("payuId");