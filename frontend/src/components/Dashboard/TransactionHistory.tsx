import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

interface Transaction {
  id: string;
  type: 'DISBURSEMENT' | 'REPAYMENT';
  amount: number;
  date: string;
  loanId: string;
  loanPurpose: string;
}

const TransactionHistory: React.FC = () => {
  const { currentUser } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (!currentUser) return;
      
      setLoading(true);
      try {
        // In a real app, this would be an API call
        // For now, we'll use mock data
        
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const mockTransactions: Transaction[] = [
          {
            id: '1',
            type: 'DISBURSEMENT',
            amount: 50000,
            date: '2021-06-10',
            loanId: '1',
            loanPurpose: 'Business'
          },
          {
            id: '2',
            type: 'REPAYMENT',
            amount: 5000,
            date: '2021-07-10',
            loanId: '1',
            loanPurpose: 'Business'
          },
          {
            id: '3',
            type: 'DISBURSEMENT',
            amount: 100000,
            date: '2021-06-08',
            loanId: '2',
            loanPurpose: 'Education'
          },
          {
            id: '4',
            type: 'REPAYMENT',
            amount: 8500,
            date: '2021-07-08',
            loanId: '2',
            loanPurpose: 'Education'
          }
        ];
        
        setTransactions(mockTransactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setError('Failed to load transaction history. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTransactions();
  }, [currentUser]);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (!currentUser) {
    return (
      <Box p={3}>
        <Typography variant="h5">Please log in to view your transaction history</Typography>
      </Box>
    );
  }

  return (
    <Box mt={3}>
      <Typography variant="h6" fontWeight="medium" mb={2}>
        Transaction History
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Loan</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <CircularProgress size={24} />
                </TableCell>
              </TableRow>
            ) : transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  No transactions found
                </TableCell>
              </TableRow>
            ) : (
              transactions
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        color={transaction.type === 'DISBURSEMENT' ? 'success.main' : 'primary'}
                        fontWeight="medium"
                      >
                        {transaction.type}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      ${transaction.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      {transaction.loanPurpose} Loan
                    </TableCell>
                  </TableRow>
                ))
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={transactions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};

export default TransactionHistory; 