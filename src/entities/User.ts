import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { IsEmail, Length } from 'class-validator';
import { Loan } from './Loan';

export enum UserRole {
    VERIFIER = 'verifier',
    ADMIN = 'admin'
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    @Length(4, 100)
    username: string;

    @Column()
    @IsEmail()
    email: string;

    @Column()
    @Length(8, 100)
    password: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VERIFIER
    })
    role: UserRole;

    @Column({ default: true })
    isActive: boolean;

    @Column({ nullable: true })
    fullName?: string;

    @Column({ nullable: true })
    profilePicture?: string;

    @OneToMany(() => Loan, loan => loan.user)
    loans: Loan[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    constructor(partial: Partial<User> = {}) {
        Object.assign(this, partial);
    }
} 