import 'reflect-metadata';
import express from 'express';
import AppDataSource from './data-source';
import authRoutes from './routes/auth.routes';
import cors from 'cors';

const app = express();
const port = process.env.PORT || 3002;

// Configure CORS to allow requests from the frontend
app.use(cors({
  origin: 'http://localhost:3000', // Your React app's URL
  credentials: true
}));

app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);

// Initialize TypeORM connection
AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!');
    
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((error) => console.log('Error during Data Source initialization:', error));

export default app; 