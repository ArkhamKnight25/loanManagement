import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Apply authentication middleware to protected routes
router.use(authenticate);

// Admin routes
router.get('/users', adminController.getAdmins);
router.post('/users', adminController.createAdmin);
router.post('/login', adminController.loginAdmin);

export default router; 