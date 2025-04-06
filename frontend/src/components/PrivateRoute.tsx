import React from 'react';
import { Route, Redirect, RouteProps } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface PrivateRouteProps extends Omit<RouteProps, 'render'> {
  component: React.ComponentType<any>;
  roles?: string[];
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ component: Component, roles, ...rest }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Route
      {...rest}
      render={(props: any) => {
        if (!currentUser) {
          // Not logged in, redirect to login page
          return <Redirect to="/login" />;
        }

        // Check if route is restricted by role
        if (roles && !roles.includes(currentUser.role)) {
          // Role not authorized, redirect to home
          return <Redirect to="/" />;
        }

        // Authorized, render component
        return <Component {...props} />;
      }}
    />
  );
};

export default PrivateRoute; 