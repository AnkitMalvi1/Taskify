import {
  Box,
  Card,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import { Edit, Save } from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    country: ''
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const response = await api.get('/users/profile');
      if (response.data) {
        setUser(response.data);
        setFormData({
          name: response.data.name,
          email: response.data.email,
          country: response.data.country || ''
        });
      }
    } catch (error) {
      console.error('Profile error:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        toast.error(error.response?.data?.error || 'Failed to fetch profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await api.patch('/users/profile', formData);
      setUser(response.data);
      setEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" sx={{ mb: 4 }}>Profile Settings</Typography>
      
      <Card sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <Avatar 
            sx={{ 
              width: 100, 
              height: 100, 
              bgcolor: 'primary.main',
              fontSize: '2.5rem'
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
          <Box sx={{ ml: 3 }}>
            <Typography variant="h5">{user?.name}</Typography>
            <Typography color="text.secondary">{user?.email}</Typography>
          </Box>
          <Button 
            startIcon={editing ? <Save /> : <Edit />}
            variant="contained"
            sx={{ ml: 'auto' }}
            onClick={() => editing ? handleUpdateProfile() : setEditing(true)}
          >
            {editing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box component="form" onSubmit={handleUpdateProfile}>
          <TextField
            fullWidth
            label="Name"
            margin="normal"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            disabled={!editing}
          />
          <TextField
            fullWidth
            label="Email"
            margin="normal"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            disabled={true}
          />
          <TextField
            fullWidth
            label="Country"
            margin="normal"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            disabled={!editing}
          />

          {editing && (
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => {
                  setEditing(false);
                  setFormData({
                    name: user.name,
                    email: user.email,
                    country: user.country
                  });
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="contained" 
                type="submit"
                disabled={!formData.name || !formData.email || !formData.country}
              >
                Save Changes
              </Button>
            </Box>
          )}
        </Box>
      </Card>
    </Box>
  );
}

export default Profile;