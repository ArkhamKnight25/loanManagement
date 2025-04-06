import { Router } from 'express';
import { 
  createLoanSub, 
  getUserLoanSubs, 
  getAllLoanSubs, 
  verifyLoanSub, 
  adminProcessLoanSub, 
  cancelLoanSub 
} from '../controllers/loanSub.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Create a new loan application
router.post('/', authenticate, createLoanSub);

// Get loans for current user
router.get('/my-loans', authenticate, getUserLoanSubs);

// Get loans for a specific user
router.get('/user/:userId', authenticate, getUserLoanSubs);

// Get all loans (for verifiers/admins)
router.get('/', authenticate, authorize(['ADMIN', 'VERIFIER']), getAllLoanSubs);

// Verifier: verify or reject a loan
router.put('/:loanId/verify', authenticate, authorize(['ADMIN', 'VERIFIER']), verifyLoanSub);

// Admin: approve or reject a verified loan
router.put('/:loanId/admin-process', authenticate, authorize(['ADMIN']), adminProcessLoanSub);

// Cancel a loan application
router.put('/:loanId/cancel', authenticate, cancelLoanSub);

export default router; 