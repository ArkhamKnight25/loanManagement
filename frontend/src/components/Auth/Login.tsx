import React, { useState } from 'react';
import { useHistory, Link, Redirect } from 'react-router-dom';
import { 
  Container, Box, Typography, TextField, Button, 
  Paper, CircularProgress, Alert, Divider, ButtonGroup,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const API_URL = 'http://localhost:3002/api'; // Update this to your actual API URL

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)'
}));

const Logo = styled(Typography)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  fontWeight: 'bold',
  color: '#4CAF50'
}));

const Form = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1),
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  backgroundColor: '#4CAF50',
  '&:hover': {
    backgroundColor: '#45a049',
  }
}));

const RoleButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(1, 0.5),
}));

// Define role-specific credentials for special login
const ROLE_CREDENTIALS = {
  ADMIN: { username: 'admin', password: 'admin' },
  VERIFIER: { username: 'verifier', password: 'verifier' }
};

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'ADMIN' | 'VERIFIER' | null>(null);
  const [roleUsername, setRoleUsername] = useState('');
  const [rolePassword, setRolePassword] = useState('');
  
  const { login, currentUser } = useAuth();
  const history = useHistory();

  // Open dialog for role-specific login
  const openRoleDialog = (role: 'ADMIN' | 'VERIFIER') => {
    setSelectedRole(role);
    setRoleUsername('');
    setRolePassword('');
    setError('');
    setDialogOpen(true);
  };

  // Handle role-specific login
  const handleRoleLogin = () => {
    if (!selectedRole) return;
    
    const credentials = ROLE_CREDENTIALS[selectedRole];
    
    // Validate credentials
    if (roleUsername !== credentials.username || rolePassword !== credentials.password) {
      setError(`Invalid credentials for ${selectedRole} role. Please try again.`);
      return;
    }
    
    try {
      setLoading(true);
      
      // Create a mock user with the selected role
      const mockUser = {
        id: '123',
        username: roleUsername,
        email: `${roleUsername.toLowerCase()}@example.com`,
        role: selectedRole
      };
      
      // Store mock user in localStorage
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('mockToken', 'mock-token-' + Date.now());
      
      setDialogOpen(false);
      
      // Force a page reload to apply the new user role
      window.location.href = '/dashboard';
    } catch (error) {
      console.error('Role login error:', error);
      setError('Failed to log in as ' + selectedRole);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      // For demonstration purposes, we'll use mock authentication
      // In a real app, you would call your API to authenticate
      console.log('Login attempt with:', { email, password });
      
      // Create a mock user with USER role
      const mockUser = {
        id: '456',
        username: email.split('@')[0] || 'User',
        email: email,
        role: 'USER' // This is key - ensuring they go to user dashboard
      };
      
      // Store mock user in localStorage
      localStorage.setItem('mockUser', JSON.stringify(mockUser));
      localStorage.setItem('mockToken', 'mock-token-' + Date.now());
      
      // Call the login function from context to update state
      await login(email, password);
      
      // Clear session storage to force proper component loading
      sessionStorage.removeItem('dashboardLoaded');
      
      // Important: add a small delay before redirecting to ensure state is updated
      setTimeout(() => {
        // Force a full page reload to dashboard
        window.location.href = '/dashboard';
      }, 100);
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Redirect if already logged in
  if (currentUser) {
    return <Redirect to="/dashboard" />;
  }

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <StyledPaper>
          <Logo variant="h4">CREDIT APP</Logo>
          <Typography component="h1" variant="h5">
            Sign in
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {error}
            </Alert>
          )}
          
          <Form onSubmit={handleSubmit}>
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              variant="outlined"
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <SubmitButton
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'SIGN IN'}
            </SubmitButton>
            
            <Box mt={2} textAlign="center">
              <Typography variant="body2">
                Don't have an account?{' '}
                <Link to="/register" style={{ color: '#4CAF50' }}>
                  Sign Up
                </Link>
              </Typography>
            </Box>
          </Form>
          
          <Divider sx={{ width: '100%', my: 3 }} />
          
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Admin Access:
          </Typography>
          
          <ButtonGroup variant="contained" aria-label="admin access buttons">
            <RoleButton 
              onClick={() => openRoleDialog('ADMIN')} 
              sx={{ bgcolor: '#f44336' }}
              disabled={loading}
            >
              ADMIN LOGIN
            </RoleButton>
            <RoleButton 
              onClick={() => openRoleDialog('VERIFIER')} 
              sx={{ bgcolor: '#2196f3' }}
              disabled={loading}
            >
              VERIFIER LOGIN
            </RoleButton>
          </ButtonGroup>
        </StyledPaper>
      </Box>

      {/* Role-specific login dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>
          {selectedRole} Authentication
        </DialogTitle>
        <DialogContent>
          <Box mb={2} mt={1}>
            <Typography variant="body2">
              Please enter your credentials to access the {selectedRole} dashboard.
            </Typography>
          </Box>
          <TextField
            autoFocus
            margin="dense"
            label="Username"
            type="text"
            fullWidth
            variant="outlined"
            value={roleUsername}
            onChange={(e) => setRoleUsername(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Password"
            type="password"
            fullWidth
            variant="outlined"
            value={rolePassword}
            onChange={(e) => setRolePassword(e.target.value)}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleRoleLogin} 
            variant="contained" 
            color="primary"
            disabled={!roleUsername || !rolePassword || loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Login'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login; 