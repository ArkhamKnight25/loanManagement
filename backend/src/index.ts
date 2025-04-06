import authRoutes from './routes/auth.routes';
import loansRoutes from './routes/loans.routes';
import adminRoutes from './routes/admin.routes';

// Setup routes
app.use('/api/auth', authRoutes);
app.use('/api/loans', loansRoutes);
app.use('/api/admin', adminRoutes); 