-- CreateTable
CREATE TABLE "LoanSub" (
    "id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "term" INTEGER NOT NULL,
    "purpose" TEXT NOT NULL,
    "employmentStatus" TEXT NOT NULL,
    "employerName" TEXT NOT NULL,
    "employerAddress" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifierComment" TEXT,
    "adminComment" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "rejectedAt" TIMESTAMP(3),
    "verifierId" TEXT,
    "adminId" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LoanSub_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "LoanSub" ADD CONSTRAINT "LoanSub_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
