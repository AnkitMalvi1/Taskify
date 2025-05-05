import { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  Typography, 
  LinearProgress,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Menu,
  MenuItem,
  CircularProgress
} from '@mui/material';
import {
  Add,
  MoreVert,
  FolderOpen,
  Assignment,
  DeleteOutline,
  Edit
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../services/api';

function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectForm, setProjectForm] = useState({
    title: '',
    description: ''
  });
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const projectsResponse = await api.get('/projects');
      const projects = projectsResponse.data;
      
      // Fetch tasks for each project
      const projectsWithTasks = await Promise.all(
        projects.map(async (project) => {
          try {
            const tasksResponse = await api.get(`/projects/${project._id}/tasks`);
            const tasks = tasksResponse.data || [];
            return {
              ...project,
              tasks,
              taskCount: tasks.length,
              completedTasks: tasks.filter(task => task.status === 'completed').length
            };
          } catch (error) {
            console.error(`Error fetching tasks for project ${project._id}:`, error);
            return {
              ...project,
              tasks: [],
              taskCount: 0,
              completedTasks: 0
            };
          }
        })
      );

      setProjects(projectsWithTasks);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleCreateProject = async () => {
    if (projects.length >= 4) {
      toast.error('Maximum limit of 4 projects reached');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please authenticate');
        navigate('/login');
        return;
      }

      const response = await api.post('/projects', projectForm);
      setProjects([...projects, response.data]);
      setOpenDialog(false);
      setProjectForm({ title: '', description: '' });
      toast.success('Project created successfully');
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || 'Failed to create project');
      }
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please authenticate');
        navigate('/login');
        return;
      }

      await api.delete(`/projects/${projectId}`);
      setProjects(projects.filter(p => p._id !== projectId));
      toast.success('Project deleted successfully');
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || 'Failed to delete project');
      }
    }
    setAnchorEl(null);
  };

  const handleEditClick = (project) => {
    setEditForm({
      title: project.title,
      description: project.description
    });
    setSelectedProject(project);
    setEditDialogOpen(true);
    setAnchorEl(null);
  };

  const handleEditProject = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Please authenticate');
        navigate('/login');
        return;
      }

      const response = await api.patch(
        `/projects/${selectedProject._id}`,
        editForm
      );
      
      setProjects(projects.map(p => 
        p._id === selectedProject._id ? response.data : p
      ));
      setEditDialogOpen(false);
      toast.success('Project updated successfully');
    } catch (error) {
      if (error.response?.status !== 401) {
        toast.error(error.response?.data?.error || 'Failed to update project');
      }
    }
  };


  return (
    <Box>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between', 
        alignItems: { xs: 'flex-start', sm: 'flex-start' },  // Changed to flex-start
        mb: 4,
        gap: { xs: 2, sm: 2 }  // Added consistent gap
      }}>
        <Box>
          <Typography 
            variant="h4" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' }
            }}
          >
            My Projects
          </Typography>
          <Typography 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
          >
            {projects.length} of 4 projects created
          </Typography>
        </Box>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
          disabled={projects.length >= 4}
          sx={{ 
            width: { xs: '100%', sm: 'auto' },
            height: 40,
            alignSelf: { xs: 'stretch', sm: 'flex-start' }
          }}
        >
          New Project
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : projects.length > 0 ? (
        <Grid 
          container 
          spacing={0} 
          sx={{ 
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 2  // Add vertical gap between cards
          }}
        >
          {projects.map((project) => (
            <Grid item xs={12} key={project._id}>
              <Card sx={{ 
                width: '100%',
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: '#fff'
              }}>
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'flex-start',
                  width: '100%',
                  mb: 3
                }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' }
                      }}
                    >
                      {project.title}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Chip 
                        label={project.status || 'active'} 
                        color="primary" 
                        size="small"
                      />
                      <Typography 
                        color="text.secondary"
                        sx={{ 
                          ml: 2,
                          fontSize: '0.875rem'
                        }}
                      >
                        {project.description}
                      </Typography>
                    </Box>
                  </Box>
                  <IconButton 
                    size="small"
                    onClick={(e) => {
                      setSelectedProject(project);
                      setAnchorEl(e.currentTarget);
                    }}
                    sx={{ ml: 2 }}
                  >
                    <MoreVert />
                  </IconButton>
                </Box>
                
                <Typography variant="h6" sx={{ mb: 2 }}>Task Progress</Typography>
                <Typography color="text.secondary" sx={{ mb: 1 }}>
                  {project.completedTasks} of {project.taskCount} tasks
                </Typography>
                <LinearProgress 
                  variant="determinate" 
                  value={project.taskCount > 0 ? (project.completedTasks / project.taskCount) * 100 : 0} 
                  sx={{ mb: 2 }} 
                />
                
                <Typography color="text.secondary" sx={{ mb: 2 }}>
                  {project.taskCount} {project.taskCount === 1 ? 'Task' : 'Tasks'}
                </Typography>

                <Button
                  variant="outlined"
                  startIcon={<Assignment />}
                  fullWidth
                  onClick={() => navigate(`/tasks/${project._id}`)}
                >
                  View Tasks
                </Button>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Card sx={{ p: { xs: 2, sm: 4 }, textAlign: 'center' }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1,
              fontSize: { xs: '1.1rem', sm: '1.25rem' }
            }}
          >
            No Projects Yet
          </Typography>
          <Typography 
            color="text.secondary" 
            sx={{ 
              mb: 3,
              fontSize: { xs: '0.875rem', sm: '1rem' }
            }}
          >
            Create your first project to get started with task management
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Create Project
          </Button>
        </Card>
      )}

      <Dialog 
        open={openDialog} 
        onClose={() => setOpenDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Create New Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
            fullWidth
            value={projectForm.title}
            onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={projectForm.description}
            onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateProject} 
            variant="contained"
            disabled={!projectForm.title || !projectForm.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog 
        open={editDialogOpen} 
        onClose={() => setEditDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit Project</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Project Title"
            fullWidth
            value={editForm.title}
            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={editForm.description}
            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleEditProject} 
            variant="contained"
            disabled={!editForm.title || !editForm.description}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => handleEditClick(selectedProject)}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit Project
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteProject(selectedProject?._id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
          Delete Project
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Dashboard;