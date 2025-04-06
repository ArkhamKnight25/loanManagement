import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Checkbox,
  FormControlLabel
} from '@mui/material';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:3002/api';

interface LoanApplicationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const LoanApplicationForm: React.FC<LoanApplicationFormProps> = ({ open, onClose, onSuccess }) => {
  const { currentUser } = useAuth();
  const [amount, setAmount] = useState<string>('');
  const [termMonths, setTermMonths] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [employmentStatus, setEmploymentStatus] = useState<string>('');
  const [employerAddress, setEmployerAddress] = useState<string>('');
  const [creditCheckConsent, setCreditCheckConsent] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleReasonChange = (event: SelectChangeEvent) => {
    setReason(event.target.value);
  };

  const handleEmploymentStatusChange = (event: SelectChangeEvent) => {
    setEmploymentStatus(event.target.value);
  };

  const handleSubmit = async () => {
    // Validate form
    if (!amount || !termMonths || !reason) {
      setError('Please fill in all required fields');
      return;
    }

    if (isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('Please enter a valid loan amount');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Field names should match what the backend expects and what's in the database
      const loanData = {
        amount: Number(amount),
        termMonths: Number(termMonths),
        purpose: reason,
        employmentStatus,
        employerAddress,
        creditCheckConsent,
        userId: currentUser?.id || 'unknown'
      };

      console.log('Submitting loan application:', loanData);

      // Post to the loans endpoint
      await axios.post(`${API_URL}/loans`, loanData);
      
      setSuccess(true);
      
      // Let parent component know we succeeded
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error) {
      console.error('Error submitting loan application:', error);
      setError('Failed to submit loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ textAlign: 'center', py: 3 }}>
        <Typography variant="h5" fontWeight="bold">APPLY FOR A LOAN</Typography>
      </DialogTitle>
      
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ my: 2 }}>
            Your loan application has been submitted successfully! We will review it shortly.
          </Alert>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 3 }}>
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Full name as it appears on bank account
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={currentUser?.username || ''}
                  disabled
                />
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  How much do you need?
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  InputProps={{
                    startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>
                  }}
                />
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Loan term (in months)
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter loan term"
                  value={termMonths}
                  onChange={(e) => setTermMonths(e.target.value)}
                />
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Employment status
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="employment-status-label">Select your status</InputLabel>
                  <Select
                    labelId="employment-status-label"
                    value={employmentStatus}
                    onChange={handleEmploymentStatusChange}
                    label="Select your status"
                  >
                    <MenuItem value="">Select your status</MenuItem>
                    <MenuItem value="Full-time">Full-time</MenuItem>
                    <MenuItem value="Part-time">Part-time</MenuItem>
                    <MenuItem value="Self-employed">Self-employed</MenuItem>
                    <MenuItem value="Unemployed">Unemployed</MenuItem>
                    <MenuItem value="Retired">Retired</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)' } }}>
                <Typography variant="subtitle2" gutterBottom>
                  Reason for loan
                </Typography>
                <FormControl fullWidth>
                  <InputLabel id="reason-label">Select reason</InputLabel>
                  <Select
                    labelId="reason-label"
                    value={reason}
                    onChange={handleReasonChange}
                    label="Select reason"
                  >
                    <MenuItem value="">Select reason</MenuItem>
                    <MenuItem value="Business">Business</MenuItem>
                    <MenuItem value="Education">Education</MenuItem>
                    <MenuItem value="Home Improvement">Home Improvement</MenuItem>
                    <MenuItem value="Medical">Medical</MenuItem>
                    <MenuItem value="Debt Consolidation">Debt Consolidation</MenuItem>
                    <MenuItem value="Personal">Personal</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <Typography variant="subtitle2" gutterBottom>
                  Employer address
                </Typography>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Enter employer address"
                  value={employerAddress}
                  onChange={(e) => setEmployerAddress(e.target.value)}
                />
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <FormControlLabel
                  control={
                    <Checkbox 
                      checked={creditCheckConsent}
                      onChange={(e) => setCreditCheckConsent(e.target.checked)}
                    />
                  }
                  label="I authorize the lender to obtain credit reports and verify my information as needed for this loan application."
                />
              </Box>
              
              <Box sx={{ width: '100%' }}>
                <Typography variant="body2" sx={{ my: 2 }}>
                  I have read the repayment terms below. Any personal/credit information 
                  collected may be disclosed from time to time to other sources, credit bureaus or 
                  other credit reporting agencies.
                </Typography>
                
                {/* Simple chart placeholder */}
                <Box 
                  sx={{ 
                    height: 150, 
                    border: '1px solid #eee', 
                    p: 2, 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Repayment Schedule Chart
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button 
          onClick={onClose} 
          color="inherit"
          disabled={loading}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          color="primary"
          disabled={loading || success}
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
        >
          {loading ? 'Submitting...' : 'Submit Application'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default LoanApplicationForm; 