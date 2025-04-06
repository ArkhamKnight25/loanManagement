import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from './User';

export enum LoanStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    APPROVED = 'approved',
    REJECTED = 'rejected'
}

@Entity('loans')
export class Loan {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column('decimal')
    amount: number;

    @Column('int', { nullable: true })
    termMonths: number;

    @Column()
    purpose: string;

    @Column({ nullable: true })
    employmentStatus: string;

    @Column({ nullable: true })
    employerAddress: string;

    @Column({ default: false })
    creditCheckConsent: boolean;

    @Column({
        type: 'enum',
        enum: LoanStatus,
        default: LoanStatus.PENDING
    })
    status: LoanStatus;

    @ManyToOne(() => User, user => user.loans)
    user: User;

    @Column({ nullable: true })
    verifiedBy?: string;

    @Column({ nullable: true })
    approvedBy?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
} 