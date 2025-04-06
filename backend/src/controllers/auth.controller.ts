import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const register = async (req: Request, res: Response) => {
  try {
    const { username, email, password, fullName, profilePicture, role } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Validate role - default to VERIFIER as per schema
    let userRole: Role = Role.VERIFIER;
    if (role && Object.values(Role).includes(role)) {
      userRole = role as Role;
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role: userRole,
        fullName,
        profilePicture,
        isActive: true
      }
    });

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userData } = user;

    return res.status(201).json({
      message: 'User registered successfully',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({ message: 'Server error during registration' });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return user data without password
    const { password: _, ...userData } = user;

    return res.status(200).json({
      message: 'Login successful',
      user: userData,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error during login' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Return user data without password
    const { password, ...userData } = user;

    return res.status(200).json(userData);
  } catch (error) {
    console.error('Get current user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const getUsers = async (req: Request, res: Response) => {
  try {
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    return res.status(200).json(users);
  } catch (error) {
    console.error('Get users error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    // @ts-ignore - user is added by auth middleware
    const userRole = req.user?.role;

    if (userRole !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied: Admin role required' });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prevent deleting oneself
    // @ts-ignore - user is added by auth middleware
    if (userId === req.user?.id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    // Delete user
    await prisma.user.delete({
      where: { id: userId }
    });

    return res.status(200).json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
}; 