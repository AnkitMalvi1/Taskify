import { useState } from 'react';
import { 
  Box, 
  Card, 
  TextField, 
  Button, 
  Typography, 
  Link,
  Container,
  Grid 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../../services/api';
import { Link as RouterLink } from 'react-router-dom';

function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    country: ''
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/users/register', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        country: formData.country
      });

      if (response.data) {
        toast.success('Signup successful! Please login.');
        navigate('/login');
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error.response?.data?.error || 'Failed to create account');
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
          Create Account
        </Typography>
        <Card sx={{ 
          p: { xs: 2, sm: 4 }, 
          width: '100%',
          maxWidth: '450px',
          boxShadow: { xs: 0, sm: 1 }
        }}>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={{ xs: 2, sm: 2 }}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="name"
                  autoComplete="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Email Address"
                  name="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  label="Country"
                  name="country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                />
              </Grid>
            </Grid>
            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ 
                mt: 3,
                mb: 2,
                py: 1.5,
                fontSize: '1rem'
              }}
              disabled={loading}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </Button>
            <Typography 
              align="center"
              sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
            >
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login" 
                underline="hover"
              >
                Sign In
              </Link>
            </Typography>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}

export default Signup;