import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export class AuthController {
    private authService = new AuthService();

    async register(req: Request, res: Response) {
        try {
            console.log('Registration request received:', req.body);
            const { username, email, password, role } = req.body;
            
            const result = await this.authService.register(username, email, password, role);
            console.log('Registration successful:', result);
            res.status(201).json(result);
        } catch (error: any) {
            console.error('Registration error:', error);
            res.status(400).json({ message: error.message });
        }
    }

    async login(req: Request, res: Response) {
        try {
            console.log('Login request received:', req.body);
            const { email, password } = req.body;
            const result = await this.authService.login(email, password);
            console.log('Login successful');
            res.json(result);
        } catch (error: any) {
            console.error('Login error:', error);
            res.status(401).json({ message: error.message });
        }
    }
} 