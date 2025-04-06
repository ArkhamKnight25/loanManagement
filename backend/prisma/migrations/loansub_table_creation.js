const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting migration to create LoanSub table...');

  try {
    // Create the LoanSub table with all needed fields
    await prisma.$executeRawUnsafe(`
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
        PRIMARY KEY ("id"),
        CONSTRAINT "LoanSub_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `);

    console.log('Successfully created LoanSub table');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

main()
  .then(() => {
    console.log('Migration completed successfully');
    process.exit(0);
  })
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 