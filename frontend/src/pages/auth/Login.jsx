import { useState } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link,
  Container
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

function Login() {
  const { login } = useAuth();  // Add this line
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/users/login', formData);
      
      if (response.data && response.data.token) {
        // Use the login function from AuthContext
        await login(response.data.user, response.data.token);
        toast.success('Login successful!');
        navigate('/dashboard', { replace: true });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box 
        sx={{ 
          minHeight: '100vh',
          py: { xs: 4, md: 8 },
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Typography 
          component="h1" 
          variant="h4" 
          sx={{ 
            mb: 4,
            fontSize: { xs: '1.75rem', md: '2.125rem' }
          }}
        >
          Welcome Back
        </Typography>
        <Card sx={{ 
          p: { xs: 2, sm: 4 }, 
          width: '100%',
          maxWidth: '450px',
          boxShadow: { xs: 0, sm: 1 }
        }}>
          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              sx={{ mb: 3 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                py: 1.5,
                mb: 2,
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            <Typography 
              align="center"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/signup" 
                underline="hover"
              >
                Sign Up
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default Login;