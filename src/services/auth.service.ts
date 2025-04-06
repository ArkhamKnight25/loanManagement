import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from './prisma.service';
import { Prisma } from '@prisma/client';

interface TokenPayload {
    id: string;
    role: string; // Using string is simpler
}

// Define Role type more explicitly
type Role = 'VERIFIER' | 'ADMIN';

export class AuthService {
    private readonly JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here';

    async register(username: string, email: string, password: string, roleInput: string = 'VERIFIER') {
        try {
            console.log('Checking for existing user:', email);
            const existingUser = await prisma.user.findUnique({
                where: { email },
            });

            if (existingUser) {
                console.log('User already exists with email:', email);
                throw new Error('Email already exists');
            }

            // Convert string to role value
            const role = roleInput?.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'VERIFIER';

            console.log('Hashing password...');
            const hashedPassword = await bcrypt.hash(password, 10);

            console.log('Creating user with details:', {
                username,
                email,
                role,
                hashedPassword: 'REDACTED',
            });

            const user = await prisma.user.create({
                data: {
                    username,
                    email,
                    password: hashedPassword,
                    role: role as Prisma.UserCreateInput['role'],
                },
            });

            console.log('User saved successfully with ID:', user.id);
            return this.generateToken(user);
        } catch (error) {
            console.error('Error during registration:', error);
            throw error;
        }
    }

    async login(email: string, password: string) {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('Invalid credentials');
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }

        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const payload: TokenPayload = {
            id: user.id,
            role: user.role,
        };

        try {
            const token = jwt.sign(
                payload,
                this.JWT_SECRET,
                { expiresIn: '24h' }
            );

            return {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    role: user.role,
                },
                token,
            };
        } catch (error) {
            throw new Error('Error generating token');
        }
    }

    verifyToken(token: string): TokenPayload {
        try {
            return jwt.verify(token, this.JWT_SECRET) as TokenPayload;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
} 
