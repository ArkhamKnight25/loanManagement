import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress,
  Paper,
  Snackbar,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Stack
} from '@mui/material';
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

interface BorrowCashFormProps {
  userId: string;
  onCancel: () => void;
  onSuccess: (newLoan: any) => void;
}

interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: 'PENDING';
  createdAt: string;
  user?: {
    username: string;
    email: string;
  };
}

const BorrowCashForm: React.FC<BorrowCashFormProps> = ({ userId, onCancel, onSuccess }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [purpose, setPurpose] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value === '' ? '' : parseInt(value));
    }
  };

  const handlePurposeChange = (e: SelectChangeEvent) => {
    setPurpose(e.target.value);
  };

  const handleDurationChange = (e: SelectChangeEvent) => {
    setDuration(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount === '' || !purpose || !duration) {
      setError('Please fill in all required fields');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      console.log("Submitting loan application:", { amount, purpose, duration, userId });
      
      // Get the auth token
      const token = localStorage.getItem('token');
      
      // Real API call if we have a token
      if (token && !localStorage.getItem('mockToken')) {
        // Set auth header
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Send request to create loan
        const response = await axios.post(`${API_URL}/loans`, {
          amount,
          purpose,
          duration: parseInt(duration),
          userId
        });
        
        console.log("Loan application response:", response.data);
        
        // Notify parent component of successful submission
        onSuccess(response.data);
        setSuccess(true);
      } else {
        // Mock response for development or when using mock tokens
        console.log("Using mock loan creation");
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const today = new Date();
        
        const newLoan: LoanApplication = {
          id: Math.random().toString(36).substr(2, 9),
          userId: userId,
          amount: amount as number,
          purpose: purpose,
          duration: parseInt(duration),
          createdAt: today.toISOString(),
          status: 'PENDING',
          user: {
            username: 'John Okah', // In a real app, we'd get this from the user profile
            email: 'john@example.com'
          }
        };
        
        setSuccess(true);
        
        // Notify parent component of successful submission
        onSuccess(newLoan);
      }
    } catch (err) {
      console.error('Error submitting loan application:', err);
      setError('Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Apply for a Loan
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <Box>
            <TextField
              fullWidth
              label="Amount ($)"
              variant="outlined"
              value={amount}
              onChange={handleAmountChange}
              error={amount === '' && error !== ''}
              helperText={amount === '' && error ? 'Amount is required' : ''}
              InputProps={{ inputProps: { min: 1000 } }}
              required
            />
          </Box>
          
          <Box>
            <FormControl fullWidth required>
              <InputLabel>Purpose</InputLabel>
              <Select
                value={purpose}
                label="Purpose"
                onChange={handlePurposeChange}
                error={!purpose && error !== ''}
              >
                <MenuItem value="business">Business</MenuItem>
                <MenuItem value="education">Education</MenuItem>
                <MenuItem value="personal">Personal</MenuItem>
                <MenuItem value="medical">Medical</MenuItem>
                <MenuItem value="housing">Housing</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box>
            <FormControl fullWidth required>
              <InputLabel>Duration</InputLabel>
              <Select
                value={duration}
                label="Duration"
                onChange={handleDurationChange}
                error={!duration && error !== ''}
              >
                <MenuItem value="3">3 months</MenuItem>
                <MenuItem value="6">6 months</MenuItem>
                <MenuItem value="12">12 months</MenuItem>
                <MenuItem value="24">24 months</MenuItem>
                <MenuItem value="36">36 months</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
            <Button 
              variant="outlined" 
              onClick={onCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Submit Application'}
            </Button>
          </Box>
        </Stack>
      </form>
      
      <Snackbar 
        open={error !== ''} 
        autoHideDuration={6000} 
        onClose={() => setError('')}
      >
        <Alert onClose={() => setError('')} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar 
        open={success} 
        autoHideDuration={6000} 
        onClose={() => setSuccess(false)}
      >
        <Alert onClose={() => setSuccess(false)} severity="success" sx={{ width: '100%' }}>
          Loan application submitted successfully!
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BorrowCashForm; 