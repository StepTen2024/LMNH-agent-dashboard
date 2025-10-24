import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Grid, 
  Card, 
  CardContent, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  Select, 
  MenuItem, 
  FormControl, 
  InputLabel, 
  TextField, 
  Button,
  IconButton,
  Collapse,
  LinearProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Visibility,
  Download,
  FilterList,
  Refresh,
  Assessment,
  Assignment,
  CheckCircle,
  Error,
  Warning,
  Schedule,
  Person,
  CalendarToday
} from '@mui/icons-material';
import { format } from 'date-fns';

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [assigneeFilter, setAssigneeFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedRows, setExpandedRows] = useState({});
  const [selectedTask, setSelectedTask] = useState(null);
  const [timelineOpen, setTimelineOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    total: 0,
    completed: 0,
    inProgress: 0,
    pending: 0,
    overdue: 0
  });

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
    calculateStats();
  }, [tasks, statusFilter, priorityFilter, assigneeFilter, searchTerm]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = tasks.filter(task => {
      const matchesStatus = statusFilter === 'all' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || task.priority === priorityFilter;
      const matchesAssignee = assigneeFilter === 'all' || task.assignee?.id === assigneeFilter;
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description.toLowerCase().includes(searchTerm.toLowerCase());
      
      return matchesStatus && matchesPriority && matchesAssignee && matchesSearch;
    });
    
    setFilteredTasks(filtered);
  };

  const calculateStats = () => {
    const stats = {
      total: tasks.length,
      completed: tasks.filter(t => t.status === 'completed').length,
      inProgress: tasks.filter(t => t.status === 'in_progress').length,
      pending: tasks.filter(t => t.status === 'pending').length,
      overdue: tasks.filter(t => new Date(t.dueDate) < new Date() && t.status !== 'completed').length
    };
    setDashboardStats(stats);
  };

  const getStatusColor = (status) => {
    const colors = {
      'pending': 'warning',
      'in_progress': 'info',
      'completed': 'success',
      'cancelled': 'error',
      'on_hold': 'secondary'
    };
    return colors[status] || 'default';
  };

  const getPriorityColor = (priority) => {
    const colors = {
      'low': 'success',
      'medium': 'warning',
      'high': 'error',
      'critical': 'error'
    };
    return colors[priority] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'pending': <Schedule />,
      'in_progress': <Assignment />,
      'completed': <CheckCircle />,
      'cancelled': <Error />,
      'on_hold': <Warning />
    };
    return icons[status] || <Schedule />;
  };

  const toggleRowExpansion = (taskId) => {
    setExpandedRows(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  const handleTaskClick = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/timeline`);
      const taskWithTimeline = await response.json();
      setSelectedTask(taskWithTimeline);
      setTimelineOpen(true);
    } catch (error) {
      console.error('Error fetching task timeline:', error);
    }
  };

  const exportTasks = () => {
    const csv = [
      ['ID', 'Title', 'Status', 'Priority', 'Assignee', 'Due Date', 'Created At', 'Completion Rate'].join(','),
      ...filteredTasks.map(task => [
        task.id,
        `"${task.title}"`,
        task.status,
        task.priority,
        task.assignee?.name || 'Unassigned',
        format(new Date(task.dueDate), 'yyyy-MM-dd'),
        format(new Date(task.createdAt), 'yyyy-MM-dd'),
        `${task.completionRate}%`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tasks_export_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  const getUniqueAssignees = () => {
    const assignees = tasks.map(task => task.assignee).filter(Boolean);
    return [...new Map(assignees.map(a => [a.id, a])).values()];
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h4" component="h1">
          Task Lifecycle Dashboard
        </Typography>
        <Box>
          <Button
            startIcon={<Download />}
            onClick={exportTasks}
            variant="outlined"
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            startIcon={<Refresh />}
            onClick={fetchTasks}
            variant="contained"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assessment color="primary" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Total Tasks
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.total}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CheckCircle color="success" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Completed
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.completed}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Assignment color="info" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    In Progress
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.inProgress}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Schedule color="warning" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Pending
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.pending}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Error color="error" sx={{ mr: 1 }} />
                <Box>
                  <Typography color="textSecondary" variant="body2">
                    Overdue
                  </Typography>
                  <Typography variant="h4">
                    {dashboardStats.overdue}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <FilterList color="primary" />
            <TextField
              label="Search Tasks"
              variant="outlined"
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ minWidth: 200 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="in_progress">In Progress</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="cancelled">Cancelled</MenuItem>
                <MenuItem value="on_hold">On Hold</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Priority</InputLabel>
              <Select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                label="Priority"
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Assignee</InputLabel>
              <Select
                value={assigneeFilter}
                onChange={(e) => setAssigneeFilter(e.target.value)}
                label="Assignee"
              >
                <MenuItem value="all">All</MenuItem>
                {getUniqueAssignees().map(assignee => (
                  <MenuItem key={assignee.id} value={assignee.id}>
                    {assignee.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </CardContent>
      </Card>

      {/* Loading */}
      {loading && <LinearProgress sx={{ mb: 2 }} />}

      {/* Tasks Table */}
      <Card>
        <CardContent>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell></TableCell>
                  <TableCell>Task</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Assignee</TableCell>
                  <TableCell>Due Date</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTasks.map((task) => (
                  <React.Fragment key={task.id}>
                    <TableRow>
                      <TableCell>
                        <IconButton
                          size="small"
                          onClick={() => toggleRowExpansion(task.id)}
                        >
                          {expandedRows[task.id] ? <ExpandLess /> : <ExpandMore />}
                        </IconButton>
                      </TableCell>
                      <TableCell>
                        <Box>
                          <Typography variant="subtitle2">
                            {task.title}
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            ID: {task.id}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(task.status)}
                          label={task.status.replace('_', ' ').toUpperCase()}
                          color={getStatusColor(task.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={task.priority.toUpperCase()}
                          color={getPriorityColor(task.priority)}
                          size="small"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Person sx={{ mr: 1, fontSize: 16 }} />
                          {task.assignee?.name || 'Unassigned'}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <CalendarToday sx={{ mr: 1, fontSize: 16 }} />
                          {format(new Date(task.dueDate), 'MMM dd, yyyy')}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Box sx={{ width: '100%', mr: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={task.completionRate}
                              sx={{ height: 8, borderRadius: 4 }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ minWidth: 35 }}>
                            {task.completionRate}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Tooltip title="View Timeline">
                          <IconButton
                            size="small"
                            onClick={() => handleTaskClick(task.id)}
                          >
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                    
                    {/* Expanded Row */}
                    <TableRow>
                      <TableCell colSpan={8} sx={{ p: 0 }}>
                        <Collapse in={expandedRows[task.id]} timeout="auto" unmountOnExit>
                          <Box sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Description
                                </Typography>
                                <Typography variant="body2" sx={{ mb: 2 }}>
                                  {task.description || 'No description provided'}
                                </Typography>
                                
                                <Typography variant="subtitle2" gutterBottom>
                                  Dependencies
                                </Typography>
                                {task.dependencies?.length > 0 ? (
                                  <List dense>
                                    {task.dependencies.map(dep => (
                                      <ListItem key={dep.id} sx={{ py: 0 }}>
                                        <ListItemText
                                          primary={dep.title}
                                          secondary={`Status: ${dep.status}`}
                                        />
                                      </ListItem>
                                    ))}
                                  </List>
                                ) : (
                                  <Typography variant="body2" color="textSecondary">
                                    No dependencies
                                  </Typography>
                                )}
                              </Grid>
                              
                              <Grid item xs={12} md={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                  Timeline Summary
                                </Typography>
                                <Box sx={{ mb: 1 }}>
                                  <Typography variant="body2">
                                    Created: {format(new Date(task.createdAt), 'MMM dd, yyyy HH:mm')}
                                  </Typography>
                                </Box>
                                {task.startedAt && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      Started: {format(new Date(task.startedAt), 'MMM dd, yyyy HH:mm')}
                                    </Typography>
                                  </Box>
                                )}
                                {task.completedAt && (
                                  <Box sx={{ mb: 1 }}>
                                    <Typography variant="body2">
                                      Completed: {format(new Date(task.completedAt), 'MMM dd, yyyy HH:mm')}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {task.tags?.length > 0 && (
                                  <Box sx={{ mt: 2 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                      Tags
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                      {task.tags.map(tag => (
                                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                                      ))}
                                    </Box>
                                  </Box>
                                )}
                              </Grid>
                            </Grid>
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          {filteredTasks.length === 0 && !loading && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                No tasks found matching your filters
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Task Timeline Dialog */}
      <Dialog
        open={timelineOpen}
        onClose={() => setTimelineOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Task Timeline: {selectedTask?.title}
        </DialogTitle>
        <DialogContent>
          {selectedTask && (
            <Box>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Task Details
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Status</Typography>
                    <Chip
                      label={selectedTask.status.replace('_', ' ').toUpperCase()}
                      color={getStatusColor(selectedTask.status)}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">Priority</Typography>
                    <Chip
                      label={selectedTask.priority.toUpperCase()}
                      color={getPriorityColor(selectedTask.priority)}
                      size="small"
                      variant="outlined"
                    />
                  </Grid>
                </Grid>
              </Box>

              <Divider sx={{ my: 2 }} />

              <Typography variant="h6" gutterBottom>
                Activity Timeline
              </Typography>
              
              {selectedTask.timeline?.length > 0 ? (
                <Timeline>
                  {selectedTask.timeline.map((event, index) => (
                    <TimelineItem key={index}>
                      <TimelineSeparator>
                        <TimelineDot color={getStatusColor(event.type)} />
                        {index < selectedTask.timeline.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent>
                        <Typography variant="subtitle2">
                          {event.action}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {event.details}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {format(new Date(event.timestamp), 'MMM dd, yyyy HH:mm')} - {event.user}
                        </Typography>
                      </TimelineContent>
                    </TimelineItem>
                  ))}
                </Timeline>
              ) : (
                <Alert severity="info">
                  No timeline events available for this task.
                </Alert>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTimelineOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Dashboard;