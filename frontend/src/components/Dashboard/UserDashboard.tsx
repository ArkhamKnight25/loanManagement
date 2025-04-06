import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  TextField, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  TablePagination,
  Tabs,
  Tab,
  CircularProgress,
  Avatar,
  IconButton,
  Stack,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Search as SearchIcon, MoreVert as MoreVertIcon } from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import BorrowCashForm from './BorrowCashForm';
import UserDashboardStats from './UserDashboardStats';
import TransactionHistory from './TransactionHistory';
import DepositForm from './DepositForm';
import LoanApplicationForm from '../Loans/LoanApplicationForm';

const API_URL = 'http://localhost:3002/api';

// Custom styled components
const CreditCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  backgroundColor: '#4CAF50',
  color: 'white',
  height: '100px',
  marginBottom: theme.spacing(3),
  width: '100%'
}));

const BalanceValue = styled(Typography)(({ theme }) => ({
  fontSize: '32px',
  fontWeight: 'bold',
  marginLeft: theme.spacing(1)
}));

const ActionButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#f5f5f5',
  color: theme.palette.text.primary,
  marginRight: theme.spacing(1),
  '&:hover': {
    backgroundColor: '#e0e0e0',
  }
}));

const GetLoanButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#78909c',
  color: 'white',
  '&:hover': {
    backgroundColor: '#546e7a',
  }
}));

interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  createdAt: string;
  user?: {
    username: string;
    email: string;
    profilePicture?: string;
  };
}

const UserDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [loanApplications, setLoanApplications] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [balance, setBalance] = useState(0);
  const [showBorrowForm, setShowBorrowForm] = useState(false);
  const [totalLoans, setTotalLoans] = useState(0);
  const [pendingAmount, setPendingAmount] = useState(0);
  const [approvedAmount, setApprovedAmount] = useState(0);
  const [rejectedAmount, setRejectedAmount] = useState(0);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancelLoanId, setCancelLoanId] = useState<string | null>(null);
  const [showLoanForm, setShowLoanForm] = useState(false);

  console.log("UserDashboard mounted with user:", currentUser);

  // Calculate statistics from loan applications
  const calculateStats = (loans: LoanApplication[]) => {
    setTotalLoans(loans.length);
    
    const pending = loans
      .filter(loan => loan.status === 'PENDING')
      .reduce((sum, loan) => sum + loan.amount, 0);
    setPendingAmount(pending);
    
    const approved = loans
      .filter(loan => loan.status === 'APPROVED')
      .reduce((sum, loan) => sum + loan.amount, 0);
    setApprovedAmount(approved);
    
    const rejected = loans
      .filter(loan => loan.status === 'REJECTED')
      .reduce((sum, loan) => sum + loan.amount, 0);
    setRejectedAmount(rejected);
  };

  // First, add a function to fetch loan applications:
  const fetchLoanApplications = async () => {
    try {
      setLoading(true);
      
      // Use the user ID from context if available
      const userId = currentUser?.id;
      
      if (!userId) {
        console.error('No user ID available');
        return;
      }
      
      // Fetch loan applications from API
      const response = await axios.get(`${API_URL}/loans/user/${userId}`);
      
      if (response.data && response.data.success) {
        const loans = response.data.data || [];
        setLoanApplications(loans);
        calculateStats(loans);
      } else {
        console.error('Failed to fetch loan applications:', response.data);
      }
    } catch (error) {
      console.error('Error fetching loan applications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Add this to your useEffect to load data when component mounts
  useEffect(() => {
    if (currentUser?.id) {
      fetchLoanApplications();
    }
  }, [currentUser]);

  // Also fetch user's balance
  useEffect(() => {
    const fetchBalance = async () => {
      // In a real app, this would come from the API
      // For now, just use a mock value
      setBalance(150000);
    };
    
    fetchBalance();
  }, []);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };

  // Make sure the handleLoanSuccess function is correctly calling this:
  const handleLoanSuccess = () => {
    // Refresh loan data
    fetchLoanApplications();
  };

  const openCancelDialog = (loanId: string) => {
    setCancelLoanId(loanId);
    setShowCancelDialog(true);
  };

  const handleCancelLoan = async () => {
    if (!cancelLoanId) return;
    
    try {
      setLoading(true);
      
      // Get the auth token
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        // Send request to cancel loan
        await axios.post(`${API_URL}/loans/${cancelLoanId}/cancel`);
      }
      
      // Update the local state
      const updatedLoans = loanApplications.map(loan => 
        loan.id === cancelLoanId 
          ? { ...loan, status: 'CANCELLED' as const } 
          : loan
      );
      
      setLoanApplications(updatedLoans);
      calculateStats(updatedLoans);
      setShowCancelDialog(false);
      setCancelLoanId(null);
    } catch (error) {
      console.error('Error cancelling loan:', error);
      setError('Failed to cancel loan application. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = (amount: number) => {
    setBalance(prevBalance => prevBalance + amount);
  };

  const filteredApplications = loanApplications.filter(application => 
    (application.user?.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.amount.toString().includes(searchQuery) ||
    application.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
    application.createdAt.includes(searchQuery) ||
    application.status.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statusColors: Record<string, string> = {
    PENDING: '#FFC107',
    VERIFIED: '#4CAF50',
    APPROVED: '#2196F3',
    REJECTED: '#F44336',
    CANCELLED: '#9E9E9E'
  };

  if (!currentUser) {
    return (
      <Box p={3}>
        <Typography variant="h5">Please log in to view your dashboard</Typography>
      </Box>
    );
  }

  // Create render functions
  const renderBorrowCash = () => (
    <BorrowCashForm 
      userId={currentUser.id} 
      onCancel={() => setShowBorrowForm(false)}
      onSuccess={handleLoanSuccess}
    />
  );

  const renderLoansTable = () => (
    <Box mt={3}>
      <UserDashboardStats
        totalLoans={totalLoans}
        pendingAmount={pendingAmount}
        approvedAmount={approvedAmount}
        rejectedAmount={rejectedAmount}
        loading={loading}
      />
      
      <Typography variant="h6" fontWeight="medium" mb={2}>
        Applied Loans
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <TextField
          placeholder="Search for loans"
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ width: '300px' }}
        />
        <Box>
          <Button size="small">Sort</Button>
          <Button size="small">Filter</Button>
        </Box>
      </Box>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Loan Officer</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Date Applied</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredApplications.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No loan applications found
                </TableCell>
              </TableRow>
            ) : (
              filteredApplications
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          {loan.user?.username ? loan.user.username.charAt(0) : 'U'}
                        </Avatar>
                        {loan.user?.username || 'Unknown User'}
                      </Box>
                    </TableCell>
                    <TableCell>${loan.amount.toLocaleString()}</TableCell>
                    <TableCell>{loan.purpose}</TableCell>
                    <TableCell>{loan.duration} months</TableCell>
                    <TableCell>{new Date(loan.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-block',
                          bgcolor: statusColors[loan.status],
                          color: 'white',
                          borderRadius: '16px',
                          px: 1.5,
                          py: 0.5,
                          fontSize: '0.75rem',
                          fontWeight: 'bold',
                          textTransform: 'capitalize'
                        }}
                      >
                        {loan.status.toLowerCase()}
                      </Box>
                    </TableCell>
                    <TableCell>
                      {loan.status === 'PENDING' ? (
                        <Button 
                          color="error" 
                          size="small"
                          onClick={() => openCancelDialog(loan.id)}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <IconButton size="small">
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredApplications.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );

  const renderTransactTab = () => (
    <TransactionHistory />
  );

  const renderDepositTab = () => (
    <DepositForm
      userId={currentUser.id}
      onSuccess={handleDeposit}
    />
  );

  // Render the loan statistics
  const renderStats = () => (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        Loan Statistics
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Total Loans
          </Typography>
          <Typography variant="h4" fontWeight="bold">
            {totalLoans}
          </Typography>
        </Paper>
        
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Pending Loan Amount
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="warning.main">
            ${pendingAmount.toLocaleString()}
          </Typography>
        </Paper>
        
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Approved Loan Amount
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="success.main">
            ${approvedAmount.toLocaleString()}
          </Typography>
        </Paper>
        
        <Paper sx={{ flex: 1, p: 2 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Rejected Loan Amount
          </Typography>
          <Typography variant="h4" fontWeight="bold" color="error.main">
            ${rejectedAmount.toLocaleString()}
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );

  return (
    <Box p={3}>
      <Stack spacing={3}>
        <CreditCard>
          <Box>
            <Typography variant="subtitle2" fontWeight="medium">
              CREDIT
            </Typography>
            <BalanceValue variant="h4">
              ${balance.toFixed(1)}
            </BalanceValue>
          </Box>
        </CreditCard>
        
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
          <GetLoanButton
            variant="contained"
            onClick={() => setShowLoanForm(true)}
          >
            Get A Loan
          </GetLoanButton>
        </Box>
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', width: '100%' }}>
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            aria-label="loan options tabs"
          >
            <Tab label="Borrow Cash" disabled={showBorrowForm} />
            <Tab label="Transact" />
            <Tab label="Deposit Cash" />
          </Tabs>
        </Box>
        
        {showBorrowForm ? (
          renderBorrowCash()
        ) : (
          <>
            {activeTab === 0 && renderLoansTable()}
            {activeTab === 1 && renderTransactTab()}
            {activeTab === 2 && renderDepositTab()}
          </>
        )}
      </Stack>
      <Dialog
        open={showCancelDialog}
        onClose={() => setShowCancelDialog(false)}
      >
        <DialogTitle>Cancel Loan Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this loan application? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowCancelDialog(false)}>No, Keep It</Button>
          <Button onClick={handleCancelLoan} color="error" variant="contained">
            Yes, Cancel Loan
          </Button>
        </DialogActions>
      </Dialog>
      <LoanApplicationForm
        open={showLoanForm}
        onClose={() => setShowLoanForm(false)}
        onSuccess={handleLoanSuccess}
      />
    </Box>
  );
};

export default UserDashboard; 