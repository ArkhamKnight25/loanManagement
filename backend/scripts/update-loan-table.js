const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Updating Loan table structure...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Loan"
      ADD COLUMN IF NOT EXISTS "term" INTEGER,
      ADD COLUMN IF NOT EXISTS "purpose" TEXT,
      ADD COLUMN IF NOT EXISTS "employmentStatus" TEXT,
      ADD COLUMN IF NOT EXISTS "employerName" TEXT,
      ADD COLUMN IF NOT EXISTS "employerAddress" TEXT,
      ADD COLUMN IF NOT EXISTS "verifierComment" TEXT,
      ADD COLUMN IF NOT EXISTS "adminComment" TEXT,
      ADD COLUMN IF NOT EXISTS "verifiedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "approvedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "rejectedAt" TIMESTAMP,
      ADD COLUMN IF NOT EXISTS "verifierId" TEXT,
      ADD COLUMN IF NOT EXISTS "adminId" TEXT;
    `);
    
    console.log('Loan table updated successfully');
  } catch (error) {
    console.error('Error updating Loan table:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 