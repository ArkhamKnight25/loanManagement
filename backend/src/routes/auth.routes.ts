import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/me', authenticate, authController.getCurrentUser);

export default router; 