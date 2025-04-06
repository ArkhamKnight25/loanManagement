import { Router } from 'express';
import authRoutes from './auth.routes';
import loanRoutes from './loans.routes';
import loanSubRoutes from './loanSub.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/loans', loanRoutes);
router.use('/loan-subs', loanSubRoutes);
router.use('/admin', adminRoutes);

export default router; 