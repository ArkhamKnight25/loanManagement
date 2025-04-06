import React from 'react';
import { Box, Paper, Typography, Stack, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
}));

const StatValue = styled(Typography)(({ theme }) => ({
  fontWeight: 'bold',
  fontSize: '24px',
  marginTop: theme.spacing(1),
}));

interface UserDashboardStatsProps {
  totalLoans: number;
  pendingAmount: number;
  approvedAmount: number;
  rejectedAmount: number;
  loading: boolean;
}

const UserDashboardStats: React.FC<UserDashboardStatsProps> = ({
  totalLoans,
  pendingAmount,
  approvedAmount,
  rejectedAmount,
  loading
}) => {
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mb={4}>
      <Typography variant="h6" gutterBottom>
        Loan Statistics
      </Typography>
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={2} 
        sx={{ width: '100%' }}
      >
        <StatsCard sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Total Loans
          </Typography>
          <StatValue>
            {totalLoans}
          </StatValue>
        </StatsCard>
        
        <StatsCard sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Pending Loan Amount
          </Typography>
          <StatValue color="warning.main">
            ${pendingAmount.toLocaleString()}
          </StatValue>
        </StatsCard>
        
        <StatsCard sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Approved Loan Amount
          </Typography>
          <StatValue color="success.main">
            ${approvedAmount.toLocaleString()}
          </StatValue>
        </StatsCard>
        
        <StatsCard sx={{ flex: 1 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Rejected Loan Amount
          </Typography>
          <StatValue color="error.main">
            ${rejectedAmount.toLocaleString()}
          </StatValue>
        </StatsCard>
      </Stack>
    </Box>
  );
};

export default UserDashboardStats; 