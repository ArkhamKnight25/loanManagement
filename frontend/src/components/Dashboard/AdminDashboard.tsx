import React, { useState, useEffect } from 'react';
import { 
  Box, Typography, Container, Paper, Grid as MuiGrid, 
  Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, Button, CircularProgress,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Chip, Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Add as AddIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon
} from '@mui/icons-material';
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

// Create a properly typed Grid component for our usage
const Grid = styled(MuiGrid)({});

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
}));

const StatCard = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
}));

const PercentChange = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: '#4CAF50',
  fontSize: '1rem',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
}));

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
}

interface Stats {
  totalLoans: number;
  totalBorrowers: number;
  totalCashDisbursed: number;
  totalCashReceived: number;
}

interface MonthlyStats {
  month: string;
  loans: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [verifiedLoans, setVerifiedLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newAdmin, setNewAdmin] = useState({
    username: '',
    email: '',
    password: '',
    role: 'ADMIN'
  });
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch statistics
      const statsResponse = await axios.get(`${API_URL}/loans/stats`);
      setStats(statsResponse.data.stats);
      setMonthlyStats(statsResponse.data.monthlyStats);
      
      // Fetch verified loans
      const loansResponse = await axios.get(`${API_URL}/loans/verified`);
      setVerifiedLoans(loansResponse.data);
    } catch (err: any) {
      console.error('Error fetching data:', err);
      setError(err?.response?.data?.message || 'Failed to load dashboard data');
      
      // Use mock data for development
      if (process.env.NODE_ENV === 'development') {
        const mockStats = {
          totalLoans: 150,
          totalBorrowers: 120,
          totalCashDisbursed: 550000,
          totalCashReceived: 350000
        };
        
        const mockMonthlyStats = [
          { month: 'Jan', loans: 15 },
          { month: 'Feb', loans: 30 },
          { month: 'Mar', loans: 20 },
          { month: 'Apr', loans: 35 },
          { month: 'May', loans: 25 },
          { month: 'Jun', loans: 40 },
          { month: 'Jul', loans: 30 },
          { month: 'Aug', loans: 45 }
        ];
        
        const mockLoans = [
          { 
            id: '1', 
            amount: 5000,
            purpose: 'Personal Loan', 
            createdAt: new Date().toISOString(), 
            status: 'VERIFIED',
            user: { id: '101', username: 'clayton', email: 'clayton@example.com' }
          },
          { 
            id: '2', 
            amount: 10000,
            purpose: 'Small Business', 
            createdAt: new Date().toISOString(), 
            status: 'VERIFIED',
            user: { id: '102', username: 'anthony', email: 'anthony@example.com' }
          },
          { 
            id: '3', 
            amount: 3000,
            purpose: 'Education', 
            createdAt: new Date().toISOString(), 
            status: 'VERIFIED',
            user: { id: '103', username: 'where', email: 'where@example.com' }
          },
          { 
            id: '4', 
            amount: 7500,
            purpose: 'Christmas Bills', 
            createdAt: new Date().toISOString(), 
            status: 'VERIFIED',
            user: { id: '104', username: 'payment', email: 'payment@example.com' }
          }
        ];
        
        setStats(mockStats);
        setMonthlyStats(mockMonthlyStats);
        setVerifiedLoans(mockLoans);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApproveLoan = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await axios.put(`${API_URL}/loans/${loanId}/approve`);
      // Update the list after approval
      setVerifiedLoans(currentLoans => 
        currentLoans.filter(loan => loan.id !== loanId)
      );
    } catch (err: any) {
      console.error('Error approving loan:', err);
      setError(err?.response?.data?.message || 'Failed to approve loan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectLoan = async (loanId: string) => {
    setActionLoading(loanId);
    try {
      await axios.put(`${API_URL}/loans/${loanId}/reject`);
      // Update the list after rejection
      setVerifiedLoans(currentLoans => 
        currentLoans.filter(loan => loan.id !== loanId)
      );
    } catch (err: any) {
      console.error('Error rejecting loan:', err);
      setError(err?.response?.data?.message || 'Failed to reject loan');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddAdmin = async () => {
    try {
      // Validate inputs
      if (!newAdmin.username || !newAdmin.email || !newAdmin.password) {
        setError('All fields are required');
        return;
      }
      
      await axios.post(`${API_URL}/auth/register`, {
        ...newAdmin,
        role: 'ADMIN'
      });
      
      // Close dialog and show success
      setOpenDialog(false);
      
      // Reset form
      setNewAdmin({
        username: '',
        email: '',
        password: '',
        role: 'ADMIN'
      });
    } catch (err: any) {
      console.error('Error adding admin:', err);
      setError(err?.response?.data?.message || 'Failed to add admin');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 3, mb: 3 }}>
        {/* Statistics */}
        <StyledPaper>
          <StatLabel variant="subtitle2">Total Loans</StatLabel>
          <StatCard>
            <StatValue variant="h3">{stats?.totalLoans || 0}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              12%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Borrowers</StatLabel>
          <StatCard>
            <StatValue variant="h3">{stats?.totalBorrowers || 0}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              8%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Disbursed (USD)</StatLabel>
          <StatCard>
            <StatValue variant="h3">${stats?.totalCashDisbursed?.toLocaleString() || 0}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              15%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Repaid (USD)</StatLabel>
          <StatCard>
            <StatValue variant="h3">${stats?.totalCashReceived?.toLocaleString() || 0}</StatValue>
            <PercentChange style={{ color: '#f44336' }}>
              <DecreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              3%
            </PercentChange>
          </StatCard>
        </StyledPaper>
      </Box>
      
      {/* Chart */}
      <StyledPaper sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Loan Demand Monthly
        </Typography>
        <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography variant="body1">
            Chart visualization will appear here after installing chart.js and react-chartjs-2
          </Typography>
        </Box>
      </StyledPaper>
      
      {/* Verified Loans Table */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Verified Loans
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenDialog(true)}
        >
          Add Admin
        </Button>
      </Box>
      
      <StyledPaper>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Applicant</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Purpose</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {verifiedLoans.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No verified loans to approve
                  </TableCell>
                </TableRow>
              ) : (
                verifiedLoans.map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>{loan.user.username}</TableCell>
                    <TableCell>{loan.user.email}</TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Chip
                        label="Verified"
                        color="primary"
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <ActionButton
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<ApproveIcon />}
                        onClick={() => handleApproveLoan(loan.id)}
                        disabled={actionLoading === loan.id}
                      >
                        {actionLoading === loan.id ? <CircularProgress size={24} /> : 'Approve'}
                      </ActionButton>
                      <ActionButton
                        variant="outlined"
                        color="error"
                        size="small"
                        startIcon={<RejectIcon />}
                        onClick={() => handleRejectLoan(loan.id)}
                        disabled={actionLoading === loan.id}
                      >
                        Reject
                      </ActionButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </StyledPaper>

      {/* Add Admin Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            value={newAdmin.username}
            onChange={(e) => setNewAdmin({...newAdmin, username: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={newAdmin.email}
            onChange={(e) => setNewAdmin({...newAdmin, email: e.target.value})}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            value={newAdmin.password}
            onChange={(e) => setNewAdmin({...newAdmin, password: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddAdmin} variant="contained" color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminDashboard;
 