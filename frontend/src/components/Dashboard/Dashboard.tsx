import React, { useEffect } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { Redirect } from 'react-router-dom';
import SideNav from '../Navigation/SideNav';
import AdminDashboard from './AdminDashboard';
import VerifierDashboard from './VerifierDashboard';
import UserDashboard from './UserDashboard';

const Dashboard: React.FC = () => {
  const { currentUser, loading } = useAuth();

  useEffect(() => {
    console.log("Dashboard mounting, current user:", currentUser);
    
    // Check if we need to force a reload for fresh state
    const dashboardLoaded = sessionStorage.getItem('dashboardLoaded');
    if (!dashboardLoaded && currentUser) {
      sessionStorage.setItem('dashboardLoaded', 'true');
      console.log("First dashboard load, setting flag");
    }
    
    return () => {
      console.log("Dashboard unmounting");
    };
  }, [currentUser]);

  console.log("Dashboard rendering state:", { currentUser, loading });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!currentUser) {
    console.log("No user found, redirecting to login");
    return <Redirect to="/login" />;
  }

  console.log("Rendering dashboard for user with role:", currentUser.role);

  return (
    <Box sx={{ display: 'flex' }}>
      <SideNav role={currentUser.role} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          height: '100vh',
          overflow: 'auto',
          bgcolor: '#f5f5f5',
          p: 3,
          pt: 8,
          ml: { xs: 0, sm: '240px' }
        }}
      >
        {currentUser.role === 'ADMIN' ? (
          <AdminDashboard />
        ) : currentUser.role === 'VERIFIER' ? (
          <VerifierDashboard />
        ) : (
          <UserDashboard />
        )}
      </Box>
    </Box>
  );
};

export default Dashboard; 