import React, { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { useHistory } from 'react-router-dom';
import {
  Button,
  TextField,
  Typography,
  Container,
  CssBaseline,
  Box,
  Link,
  Paper
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledPaper = styled(Paper)(({ theme }) => ({
  marginTop: theme.spacing(8),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(3)
}));

const StyledForm = styled('form')(({ theme }) => ({
  width: '100%',
  marginTop: theme.spacing(1)
}));

const SubmitButton = styled(Button)(({ theme }) => ({
  margin: theme.spacing(3, 0, 2),
  backgroundColor: '#4CAF50',
  color: 'white',
  '&:hover': {
    backgroundColor: '#388E3C'
  }
}));

const ErrorMessage = styled(Typography)(({ theme }) => ({
  color: 'red',
  marginTop: theme.spacing(2)
}));

const Login: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const history = useHistory();

  const validate = () => {
    const newErrors: { email?: string; password?: string } = {};
    if (!email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    
    if (!password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setSubmitting(true);
    try {
      await login(email, password);
      history.push('/dashboard');
    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <StyledPaper>
        <Typography component="h1" variant="h5" color="primary">
          CREDIT APP - Sign In
        </Typography>
        <StyledForm onSubmit={handleSubmit}>
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={!!errors.email}
            helperText={errors.email}
          />
          <TextField
            variant="outlined"
            margin="normal"
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
          />
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <SubmitButton
            type="submit"
            fullWidth
            variant="contained"
            disabled={submitting}
          >
            Sign In
          </SubmitButton>
          <Box sx={{ mt: 2 }}>
            <Link href="/register" variant="body2">
              {"Don't have an account? Sign Up"}
            </Link>
          </Box>
        </StyledForm>
      </StyledPaper>
    </Container>
  );
};

export default Login; 