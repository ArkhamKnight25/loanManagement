import React from 'react';
import { Route, Redirect, RouteProps, RouteComponentProps } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps extends Omit<RouteProps, 'children'> {
  children: React.ReactNode;
  roles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  roles,
  ...rest 
}) => {
  const { currentUser, loading } = useAuth();

  console.log("ProtectedRoute rendering", { currentUser, loading, path: rest.path });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Route
      {...rest}
      render={(props: RouteComponentProps) => {
        // Check if user is authenticated
        if (!currentUser) {
          console.log("Not authenticated, redirecting to login");
          return (
            <Redirect
              to={{
                pathname: '/login',
                state: { from: props.location }
              }}
            />
          );
        }

        // Check role-based access if roles are specified
        if (roles && !roles.includes(currentUser.role)) {
          console.log("Unauthorized role, redirecting to dashboard");
          return (
            <Redirect
              to={{
                pathname: '/dashboard',
                state: { from: props.location }
              }}
            />
          );
        }

        // If authenticated and authorized, render the component
        console.log("Authorized, rendering component");
        return children;
      }}
    />
  );
};

export default ProtectedRoute; 