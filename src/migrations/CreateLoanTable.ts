import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLoanTable implements MigrationInterface {
    name = 'CreateLoanTable1234567891';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE "public"."loan_status_enum" AS ENUM('pending', 'verified', 'approved', 'rejected')
        `);
        
        await queryRunner.query(`
            CREATE TABLE "loans" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "amount" decimal NOT NULL,
                "purpose" character varying NOT NULL,
                "status" "public"."loan_status_enum" NOT NULL DEFAULT 'pending',
                "verifiedBy" uuid,
                "approvedBy" uuid,
                "userId" uuid,
                "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
                "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "FK_user_loans" FOREIGN KEY ("userId") REFERENCES "users"("id"),
                CONSTRAINT "PK_loans" PRIMARY KEY ("id")
            )
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "loans"`);
        await queryRunner.query(`DROP TYPE "public"."loan_status_enum"`);
    }
} 