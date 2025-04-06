import { Router } from 'express';
import { createLoan, getUserLoans, getPendingLoans } from '../controllers/loans.controller';
import { authenticateJWT } from '../middleware/auth.middleware';

const router = Router();

// Create a new loan application
router.post('/', authenticateJWT, createLoan);

// Get loans for a specific user
router.get('/user/:userId', authenticateJWT, getUserLoans);

// Get all pending loans (for verifiers)
router.get('/pending', authenticateJWT, getPendingLoans);

export default router; 