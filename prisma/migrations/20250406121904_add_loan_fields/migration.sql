-- AlterTable
ALTER TABLE "Loan" ADD COLUMN     "creditCheckConsent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "employerAddress" TEXT,
ADD COLUMN     "employmentStatus" TEXT,
ADD COLUMN     "termMonths" INTEGER;
