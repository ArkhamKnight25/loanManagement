import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Redirect } from 'react-router-dom';
import { Button, Container, Typography, Paper } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  margin: theme.spacing(3, 0),
}));

const Dashboard: React.FC = () => {
  const { currentUser, logout } = useAuth();

  if (!currentUser) {
    return <Redirect to="/login" />;
  }

  return (
    <Container>
      <StyledPaper>
        <Typography variant="h4" gutterBottom>
          Welcome, {currentUser.username}!
        </Typography>
        <Typography variant="body1" gutterBottom>
          You are logged in as a {currentUser.role}.
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={logout}
          style={{ marginTop: '1rem' }}
        >
          Logout
        </Button>
      </StyledPaper>
    </Container>
  );
};

export default Dashboard; 