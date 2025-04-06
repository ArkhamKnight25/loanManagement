import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container, Paper, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Box,
  Button, Chip, CircularProgress, Alert,
  Stack, Avatar, TextField, FormControl, InputLabel, Select, MenuItem, SelectChangeEvent,
  TablePagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon,
  TrendingUp as IncreaseIcon,
  TrendingDown as DecreaseIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { useAuth } from '../../context/AuthContext';

const API_URL = 'http://localhost:3002/api';

// Styled components
const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  boxShadow: '0px 3px 6px rgba(0, 0, 0, 0.1)',
  borderRadius: '8px'
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontSize: '2rem',
  fontWeight: 'bold',
  marginBottom: theme.spacing(1),
  color: '#333',
}));

const StatLabel = styled(Typography)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontSize: '0.875rem',
  textTransform: 'uppercase',
  letterSpacing: '0.5px'
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
  fontSize: '0.875rem',
}));

const ActionButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(0.5),
  textTransform: 'none',
}));

const ChartContainer = styled(Box)(({ theme }) => ({
  height: '300px',
  marginTop: theme.spacing(2),
  position: 'relative',
}));

const ChartBar = styled(Box)(({ theme }) => ({
  position: 'absolute',
  bottom: 0,
  width: '25px',
  borderRadius: '4px 4px 0 0',
  backgroundColor: '#4CAF50',
}));

const TableTitle = styled(Typography)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  fontWeight: 'bold',
  color: '#333'
}));

interface User {
  id: string;
  username: string;
  email: string;
  profile_picture: string | null;
}

interface Loan {
  id: string;
  amount: number;
  purpose: string;
  status: string;
  createdAt: string;
  user: User;
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

interface LoanApplication {
  id: string;
  userId: string;
  amount: number;
  purpose: string;
  duration: number;
  status: string;
  createdAt: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  verifierId?: string;
  verifierComment?: string;
}

const VerifierDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [loans, setLoans] = useState<LoanApplication[]>([]);
  const [filteredLoans, setFilteredLoans] = useState<LoanApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // For action dialog
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<LoanApplication | null>(null);
  const [actionType, setActionType] = useState<'VERIFY' | 'REJECT'>('VERIFY');
  const [comment, setComment] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Stats
  const [pendingCount, setPendingCount] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);

  useEffect(() => {
    fetchLoans();
  }, []);

  // Fetch all loans
  const fetchLoans = async () => {
    setLoading(true);
    try {
      // Get the auth token
      const token = localStorage.getItem('token');
      const mockToken = localStorage.getItem('mockToken');
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      // Try to fetch from API first
      if (token && !mockToken) {
        try {
          const response = await axios.get(`${API_URL}/loans`);
          console.log("All loans from API:", response.data);
          setLoans(response.data);
          applyFilters(response.data, searchQuery, statusFilter);
          calculateStats(response.data);
          return;
        } catch (err) {
          console.error("Failed to fetch loans from API, using mock data:", err);
        }
      }
      
      // Mock data for development
      const mockLoans: LoanApplication[] = [
        {
          id: '1',
          userId: '101',
          amount: 50000,
          purpose: 'Business',
          duration: 12,
          status: 'PENDING',
          createdAt: '2021-06-09T10:00:00Z',
          user: {
            id: '101',
            username: 'John Smith',
            email: 'john@example.com'
          }
        },
        {
          id: '2',
          userId: '102',
          amount: 25000,
          purpose: 'Education',
          duration: 24,
          status: 'PENDING',
          createdAt: '2021-06-10T11:30:00Z',
          user: {
            id: '102',
            username: 'Jane Doe',
            email: 'jane@example.com'
          }
        },
        {
          id: '3',
          userId: '103',
          amount: 75000,
          purpose: 'Housing',
          duration: 36,
          status: 'VERIFIED',
          createdAt: '2021-06-08T09:15:00Z',
          verifierId: 'V001',
          verifierComment: 'All documents verified',
          user: {
            id: '103',
            username: 'Robert Johnson',
            email: 'robert@example.com'
          }
        },
        {
          id: '4',
          userId: '104',
          amount: 30000,
          purpose: 'Medical',
          duration: 6,
          status: 'REJECTED',
          createdAt: '2021-06-07T14:20:00Z',
          verifierId: 'V001',
          verifierComment: 'Insufficient documentation',
          user: {
            id: '104',
            username: 'Alice Brown',
            email: 'alice@example.com'
          }
        }
      ];
      
      setLoans(mockLoans);
      applyFilters(mockLoans, searchQuery, statusFilter);
      calculateStats(mockLoans);
    } catch (error) {
      console.error('Error fetching loans:', error);
      setError('Failed to load loan applications.');
    } finally {
      setLoading(false);
    }
  };

  // Apply search and filter
  const applyFilters = (loanData: LoanApplication[], search: string, status: string) => {
    let result = [...loanData];
    
    // Apply search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(loan => 
        loan.user.username.toLowerCase().includes(searchLower) ||
        loan.user.email.toLowerCase().includes(searchLower) ||
        loan.purpose.toLowerCase().includes(searchLower) ||
        loan.amount.toString().includes(search) ||
        loan.status.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply status filter
    if (status) {
      result = result.filter(loan => loan.status === status);
    }
    
    setFilteredLoans(result);
  };

  // Calculate statistics
  const calculateStats = (loanData: LoanApplication[]) => {
    const pending = loanData.filter(loan => loan.status === 'PENDING').length;
    const verified = loanData.filter(loan => loan.status === 'VERIFIED').length;
    const rejected = loanData.filter(loan => loan.status === 'REJECTED').length;
    
    setPendingCount(pending);
    setVerifiedCount(verified);
    setRejectedCount(rejected);
  };

  // Handle search input change
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    applyFilters(loans, event.target.value, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent) => {
    setStatusFilter(event.target.value);
    applyFilters(loans, searchQuery, event.target.value);
  };

  // Open action dialog
  const openActionDialog = (loan: LoanApplication, action: 'VERIFY' | 'REJECT') => {
    setSelectedLoan(loan);
    setActionType(action);
    setComment('');
    setActionDialogOpen(true);
  };

  // Handle loan action (verify/reject)
  const handleLoanAction = async () => {
    if (!selectedLoan) return;
    
    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const mockToken = localStorage.getItem('mockToken');
      
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      }
      
      const status = actionType === 'VERIFY' ? 'VERIFIED' : 'REJECTED';
      
      // Try API call first
      if (token && !mockToken) {
        try {
          await axios.put(`${API_URL}/loans/${selectedLoan.id}/status`, {
            status,
            verifierId: currentUser?.id,
            verifierComment: comment
          });
        } catch (err) {
          console.error("Failed to update loan status via API:", err);
          // Continue to update the UI even if API fails
        }
      }
      
      // Update locally
      const updatedLoans = loans.map(loan => 
        loan.id === selectedLoan.id 
          ? { 
              ...loan, 
              status, 
              verifierId: currentUser?.id, 
              verifierComment: comment 
            } 
          : loan
      );
      
      setLoans(updatedLoans);
      applyFilters(updatedLoans, searchQuery, statusFilter);
      calculateStats(updatedLoans);
      setActionDialogOpen(false);
      
      // Show success message or notification
    } catch (error) {
      console.error('Error updating loan status:', error);
      setError('Failed to update loan status. Please try again.');
    } finally {
      setActionLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Status color mapping
  const statusColors: Record<string, string> = {
    'PENDING': '#FFC107',
    'VERIFIED': '#4CAF50',
    'APPROVED': '#2196F3',
    'REJECTED': '#F44336',
    'CANCELLED': '#9E9E9E'
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
            <StatValue variant="h3">{loans.length}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              12%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Borrowers</StatLabel>
          <StatCard>
            <StatValue variant="h3">{loans.length}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              8%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Disbursed (USD)</StatLabel>
          <StatCard>
            <StatValue variant="h3">${loans.reduce((total, loan) => total + loan.amount, 0).toLocaleString()}</StatValue>
            <PercentChange>
              <IncreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              15%
            </PercentChange>
          </StatCard>
        </StyledPaper>
        
        <StyledPaper>
          <StatLabel variant="subtitle2">Repaid (USD)</StatLabel>
          <StatCard>
            <StatValue variant="h3">${loans.reduce((total, loan) => total + loan.amount, 0).toLocaleString()}</StatValue>
            <PercentChange style={{ color: '#f44336' }}>
              <DecreaseIcon fontSize="small" sx={{ mr: 0.5 }} />
              3%
            </PercentChange>
          </StatCard>
        </StyledPaper>
      </Box>
      
      {/* Search and Filter */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <TextField
          placeholder="Search applications..."
          variant="outlined"
          size="small"
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: <SearchIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
          }}
          sx={{ width: '300px' }}
        />
        
        <FormControl size="small" sx={{ width: '200px' }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={statusFilter}
            label="Status"
            onChange={handleStatusFilterChange}
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="VERIFIED">Verified</MenuItem>
            <MenuItem value="REJECTED">Rejected</MenuItem>
          </Select>
        </FormControl>
      </Box>
      
      {/* Loan Applications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Applicant</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Purpose</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Application Date</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : filteredLoans.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No loan applications found.
                </TableCell>
              </TableRow>
            ) : (
              filteredLoans
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((loan) => (
                  <TableRow key={loan.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 32, height: 32, mr: 1 }}>
                          {loan.user.username.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {loan.user.username}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {loan.user.email}
                          </Typography>
                        </Box>
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
                          bgcolor: statusColors[loan.status] || '#9E9E9E',
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
                    <TableCell align="center">
                      {loan.status === 'PENDING' && (
                        <Box>
                          <Button
                            color="primary"
                            variant="contained"
                            size="small"
                            onClick={() => openActionDialog(loan, 'VERIFY')}
                            sx={{ mr: 1 }}
                          >
                            Verify
                          </Button>
                          <Button
                            color="error"
                            variant="outlined"
                            size="small"
                            onClick={() => openActionDialog(loan, 'REJECT')}
                          >
                            Reject
                          </Button>
                        </Box>
                      )}
                      {loan.status !== 'PENDING' && (
                        <Typography variant="caption" color="textSecondary">
                          {loan.verifierComment || 'No comment'}
                        </Typography>
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
          count={filteredLoans.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
      
      {/* Action Dialog */}
      <Dialog open={actionDialogOpen} onClose={() => setActionDialogOpen(false)}>
        <DialogTitle>
          {actionType === 'VERIFY' ? 'Verify Loan Application' : 'Reject Loan Application'}
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography variant="body2">
              {actionType === 'VERIFY' 
                ? 'Please confirm that you have verified all documents and information for this loan application.'
                : 'Please provide a reason for rejecting this loan application.'}
            </Typography>
          </Box>
          
          <TextField
            fullWidth
            label="Comment"
            multiline
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder={actionType === 'VERIFY' 
              ? 'All documents verified and information is correct.'
              : 'Reason for rejection...'}
            variant="outlined"
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialogOpen(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleLoanAction} 
            variant="contained" 
            color={actionType === 'VERIFY' ? 'primary' : 'error'}
            disabled={actionLoading}
          >
            {actionLoading ? (
              <CircularProgress size={24} />
            ) : actionType === 'VERIFY' ? (
              'Verify Application'
            ) : (
              'Reject Application'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default VerifierDashboard; 