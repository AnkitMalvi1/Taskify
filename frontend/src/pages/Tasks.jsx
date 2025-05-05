import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Card,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  IconButton,
  Menu,
  Chip,
  CircularProgress,
  Breadcrumbs,
  Link
} from '@mui/material';
import {
  Add,
  MoreVert,
  Edit,
  DeleteOutline,
  ArrowBack
} from '@mui/icons-material';
import { toast } from 'react-toastify';
import api from '../services/api';

function Tasks() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    status: 'pending'
  });

  const fetchProjectAndTasks = async () => {
    setLoading(true);
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/projects/${projectId}/tasks`)
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data || []);
    } catch (error) {
      toast.error('Failed to fetch project data');
      console.error('Error fetching project data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectAndTasks();
  }, [projectId]);

  const handleCreateTask = async () => {
    try {
      const response = await api.post('/tasks', {
        ...taskForm,
        project: projectId,
        assignedTo: JSON.parse(localStorage.getItem('user'))._id // Add this line
      });
      setTasks([...tasks, response.data]);
      setOpenDialog(false);
      setTaskForm({ title: '', description: '', status: 'pending' });
      toast.success('Task created successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    try {
      const response = await api.patch(`/tasks/${selectedTask._id}`, taskForm);
      setTasks(tasks.map(t => t._id === selectedTask._id ? response.data : t));
      setEditDialogOpen(false);
      toast.success('Task updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(t => t._id !== taskId));
      setAnchorEl(null);
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete task');
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
    <Box sx={{ p: 3 }}>
      <Breadcrumbs sx={{ mb: 2 }}>
        <Link 
          component="button"
          underline="hover" 
          color="inherit"
          onClick={() => navigate('/dashboard')}
        >
          Projects
        </Link>
        <Typography color="text.primary">{project?.title}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4">Tasks</Typography>
        <Button 
          variant="contained" 
          startIcon={<Add />}
          onClick={() => setOpenDialog(true)}
        >
          Add Task
        </Button>
      </Box>

      {tasks.length === 0 ? (
        <Card sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">No Tasks Yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
            Start by creating your first task
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => setOpenDialog(true)}
          >
            Create Task
          </Button>
        </Card>
      ) : (
        tasks.map((task) => (
          <Card key={task._id} sx={{ p: 3, mb: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <Box sx={{ flex: 1 }}>
                <Typography variant="h6">{task.title}</Typography>
                <Typography color="text.secondary" sx={{ mt: 1, mb: 2 }}>
                  {task.description}
                </Typography>
                <Chip 
                  label={task.status} 
                  color={
                    task.status === 'completed' ? 'success' :
                    task.status === 'in-progress' ? 'warning' : 'error'
                  }
                  size="small"
                />
              </Box>
              <IconButton onClick={(e) => {
                setSelectedTask(task);
                setAnchorEl(e.currentTarget);
              }}>
                <MoreVert />
              </IconButton>
            </Box>
          </Card>
        ))
      )}

      {/* Create Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Status"
            fullWidth
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateTask}
            variant="contained"
            disabled={!taskForm.title || !taskForm.description}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Task</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Title"
            fullWidth
            value={taskForm.title}
            onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={4}
            value={taskForm.description}
            onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
          />
          <TextField
            select
            margin="dense"
            label="Status"
            fullWidth
            value={taskForm.status}
            onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}
          >
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="in-progress">In Progress</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateTask}
            variant="contained"
            disabled={!taskForm.title || !taskForm.description}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={() => {
          setTaskForm({
            title: selectedTask.title,
            description: selectedTask.description,
            status: selectedTask.status
          });
          setEditDialogOpen(true);
          setAnchorEl(null);
        }}>
          <Edit fontSize="small" sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => handleDeleteTask(selectedTask._id)}
          sx={{ color: 'error.main' }}
        >
          <DeleteOutline fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
}

export default Tasks;