import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  CircularProgress,
  Alert,
  Stack
} from '@mui/material';

interface DepositFormProps {
  userId: string;
  onSuccess: (amount: number) => void;
}

const DepositForm: React.FC<DepositFormProps> = ({ userId, onSuccess }) => {
  const [amount, setAmount] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value === '' ? '' : parseInt(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (amount === '' || (amount as number) <= 0) {
      setError('Please enter a valid amount');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      // Simulate API call for deposit
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // In a real app, this would be an API call to record the deposit
      console.log('Deposit successful:', { userId, amount });
      
      setSuccess(true);
      onSuccess(amount as number);
      setAmount('');
    } catch (error) {
      console.error('Error processing deposit:', error);
      setError('Failed to process deposit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Deposit Cash
      </Typography>
      
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Deposit successful! Your balance has been updated.
        </Alert>
      )}
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
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
              InputProps={{ inputProps: { min: 1 } }}
              required
            />
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Deposit'}
            </Button>
          </Box>
        </Stack>
      </form>
    </Paper>
  );
};

export default DepositForm; 