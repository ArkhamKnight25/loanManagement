import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect, useLocation, useHistory } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import Dashboard from './components/Dashboard/Dashboard';
import { Box, CircularProgress, Typography, Button, Paper } from '@mui/material';
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50',
    },
    secondary: {
      main: '#FFC107',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
  },
});

// Component to force reload on navigation
const RouteChangeHandler: React.FC = () => {
  const location = useLocation();
  const history = useHistory();

  useEffect(() => {
    const handleRouteChange = () => {
      const lastPath = sessionStorage.getItem('lastPath');
      const currentPath = location.pathname;
      
      if (lastPath && lastPath !== currentPath) {
        // Store the new path before reloading
        sessionStorage.setItem('lastPath', currentPath);
        // Force reload
        window.location.reload();
      } else if (!lastPath) {
        // First navigation, just store the path
        sessionStorage.setItem('lastPath', currentPath);
      }
    };

    // Listen for route changes
    const unlisten = history.listen(handleRouteChange);
    
    // Clean up listener
    return () => {
      unlisten();
    };
  }, [history, location]);

  return null;
};

// Create a wrapper component to handle auth state loading
const AppRoutes = () => {
  const { loading, currentUser } = useAuth();
  const [error, setError] = useState<Error | null>(null);

  if (error) {
    return (
      <Box 
        display="flex" 
        flexDirection="column"
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
        p={3}
      >
        <Paper 
          elevation={3}
          sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}
        >
          <Typography variant="h5" color="error" gutterBottom>
            Something went wrong
          </Typography>
          <Typography variant="body1" paragraph>
            {error.message}
          </Typography>
          <Button 
            variant="contained" 
            color="primary"
            onClick={() => window.location.href = '/login'}
          >
            Back to Login
          </Button>
        </Paper>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        height="100vh"
      >
        <CircularProgress />
      </Box>
    );
  }

  console.log("Auth state in AppRoutes:", { currentUser, loading });

  return (
    <>
      <RouteChangeHandler />
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        <ProtectedRoute path="/dashboard">
          <Dashboard />
        </ProtectedRoute>
        <ProtectedRoute path="/profile">
          <Box p={3}>
            <Typography variant="h5">Profile Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/applications">
          <Box p={3}>
            <Typography variant="h5">Applications Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/users" roles={['ADMIN']}>
          <Box p={3}>
            <Typography variant="h5">Users Management</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/statistics" roles={['ADMIN', 'VERIFIER']}>
          <Box p={3}>
            <Typography variant="h5">Statistics Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/loan-requests" roles={['VERIFIER', 'ADMIN']}>
          <Box p={3}>
            <Typography variant="h5">Loan Requests Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/reports" roles={['ADMIN', 'VERIFIER']}>
          <Box p={3}>
            <Typography variant="h5">Reports Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/settings">
          <Box p={3}>
            <Typography variant="h5">Settings Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/my-loans" roles={['USER']}>
          <Box p={3}>
            <Typography variant="h5">My Loans Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <ProtectedRoute path="/payments" roles={['USER']}>
          <Box p={3}>
            <Typography variant="h5">Payments Page</Typography>
            <Typography variant="body1">(Coming soon)</Typography>
          </Box>
        </ProtectedRoute>
        <Route path="/" exact>
          <Redirect to="/dashboard" />
        </Route>
      </Switch>
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <AuthProvider>
          <Router>
            <AppRoutes />
          </Router>
        </AuthProvider>
      </ErrorBoundary>
    </ThemeProvider>
  );
};

// Basic Error Boundary
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("App error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box 
          display="flex" 
          flexDirection="column"
          justifyContent="center" 
          alignItems="center" 
          height="100vh"
          p={3}
        >
          <Paper 
            elevation={3}
            sx={{ p: 4, maxWidth: 500, textAlign: 'center' }}
          >
            <Typography variant="h5" color="error" gutterBottom>
              Something went wrong
            </Typography>
            <Typography variant="body1" paragraph>
              {this.state.error?.message || "An unexpected error occurred"}
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default App;
