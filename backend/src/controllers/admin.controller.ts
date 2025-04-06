import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Get all admin users
export const getAdmins = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        createdBy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(admins);
  } catch (error) {
    console.error('Error getting admin users:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Create a new admin
export const createAdmin = async (req: Request, res: Response) => {
  try {
    const { username, email, password, createdBy } = req.body;

    // @ts-ignore - user is added by auth middleware
    if (req.user?.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    // Check if admin exists
    const existingAdmin = await prisma.admin.findFirst({
      where: {
        OR: [
          { username },
          { email }
        ]
      }
    });

    if (existingAdmin) {
      return res.status(400).json({ message: 'Admin with this username or email already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create admin
    const admin = await prisma.admin.create({
      data: {
        username,
        email,
        password: hashedPassword,
        createdBy: createdBy || req.user?.id
      },
      select: {
        id: true,
        username: true,
        email: true,
        createdAt: true,
        createdBy: true
      }
    });

    res.status(201).json(admin);
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Admin login
export const loginAdmin = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Username and password are required' });
    }

    // Find admin by username
    const admin = await prisma.admin.findFirst({
      where: { username }
    });

    if (!admin) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, admin.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT (using the same format as the regular user login)
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'ADMIN' },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return admin data without password
    const { password: _, ...adminData } = admin;

    return res.status(200).json({
      message: 'Login successful',
      user: { ...adminData, role: 'ADMIN' },
      token
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};