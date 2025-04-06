const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Running migration: Creating loan tables...');
  
  // This step isn't necessary when using Prisma migrate, but included for completeness
  await prisma.$executeRaw`
    CREATE TABLE IF NOT EXISTS "User" (
      "id" TEXT NOT NULL,
      "username" TEXT NOT NULL,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "role" TEXT NOT NULL DEFAULT 'USER',
      "profilePicture" TEXT,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      PRIMARY KEY ("id")
    );
    
    CREATE TABLE IF NOT EXISTS "LoanApplication" (
      "id" TEXT NOT NULL,
      "amount" DECIMAL(65,30) NOT NULL,
      "purpose" TEXT NOT NULL,
      "duration" INTEGER NOT NULL,
      "employmentStatus" TEXT,
      "employerName" TEXT,
      "employerAddress" TEXT,
      "status" TEXT NOT NULL DEFAULT 'PENDING',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "userId" TEXT NOT NULL,
      "verifierId" TEXT,
      "verifierComment" TEXT,
      "adminId" TEXT,
      "adminComment" TEXT,
      PRIMARY KEY ("id"),
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
    );
    
    CREATE TABLE IF NOT EXISTS "Admin" (
      "id" TEXT NOT NULL,
      "username" TEXT NOT NULL UNIQUE,
      "email" TEXT NOT NULL UNIQUE,
      "password" TEXT NOT NULL,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL,
      "createdBy" TEXT,
      PRIMARY KEY ("id")
    );
  `;
  
  console.log('Migration completed successfully');
}

main()
  .catch((e) => {
    console.error('Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 