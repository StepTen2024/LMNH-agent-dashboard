import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Clock, User, Calendar, MessageSquare, FileText, Activity, AlertTriangle, CheckCircle, XCircle, Pause } from 'lucide-react';

const TaskDetail = ({ taskId, onClose, onUpdate }) => {
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedAssignee, setSelectedAssignee] = useState('');
  const [timeEntries, setTimeEntries] = useState([]);
  const [dependencies, setDependencies] = useState([]);

  useEffect(() => {
    fetchTaskDetails();
  }, [taskId]);

  const fetchTaskDetails = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`);
      const data = await response.json();
      setTask(data);
      setSelectedStatus(data.status);
      setSelectedAssignee(data.assignee_id);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching task details:', error);
      setLoading(false);
    }
  };

  const fetchTimeEntries = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/time-entries`);
      const data = await response.json();
      setTimeEntries(data);
    } catch (error) {
      console.error('Error fetching time entries:', error);
    }
  };

  const fetchDependencies = async () => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/dependencies`);
      const data = await response.json();
      setDependencies(data);
    } catch (error) {
      console.error('Error fetching dependencies:', error);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      setSelectedStatus(newStatus);
      setTask(prev => ({ ...prev, status: newStatus }));
      onUpdate?.();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  const handleAssigneeChange = async (assigneeId) => {
    try {
      await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ assignee_id: assigneeId })
      });
      setSelectedAssignee(assigneeId);
      setTask(prev => ({ ...prev, assignee_id: assigneeId }));
      onUpdate?.();
    } catch (error) {
      console.error('Error updating assignee:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) return;
    
    try {
      await fetch(`/api/tasks/${taskId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: comment })
      });
      setComment('');
      fetchTaskDetails();
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'todo': return <Clock className="w-4 h-4" />;
      case 'in_progress': return <Activity className="w-4 h-4" />;
      case 'completed': return <CheckCircle className="w-4 h-4" />;
      case 'blocked': return <XCircle className="w-4 h-4" />;
      case 'on_hold': return <Pause className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      case 'blocked': return 'bg-red-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      case 'critical': return 'bg-red-500 text-white';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateProgress = () => {
    if (!task) return 0;
    switch (task.status) {
      case 'todo': return 0;
      case 'in_progress': return 50;
      case 'completed': return 100;
      case 'blocked': return 25;
      case 'on_hold': return 25;
      default: return 0;
    }
  };

  const formatDuration = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg">
          <p>Task not found</p>
          <Button onClick={onClose} className="mt-4">Close</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{task.title}</h1>
              <div className="flex items-center gap-4 mb-4">
                <Badge className={`${getStatusColor(task.status)} text-white`}>
                  {getStatusIcon(task.status)}
                  <span className="ml-1 capitalize">{task.status?.replace('_', ' ')}</span>
                </Badge>
                <Badge className={getPriorityColor(task.priority)}>
                  {task.priority === 'critical' && <AlertTriangle className="w-3 h-3 mr-1" />}
                  <span className="capitalize">{task.priority}</span>
                </Badge>
                <span className="text-sm text-gray-500">#{task.id}</span>
              </div>
              <Progress value={calculateProgress()} className="mb-4" />
            </div>
            <Button variant="outline" onClick={onClose}>Close</Button>
          </div>

          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
              <TabsTrigger value="time">Time Tracking</TabsTrigger>
              <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
              <TabsTrigger value="files">Files</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Description
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {task.description || 'No description provided.'}
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="mt-4">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Comments
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {task.comments?.map((comment) => (
                          <div key={comment.id} className="flex gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage src={comment.user?.avatar} />
                              <AvatarFallback>{comment.user?.name?.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">{comment.user?.name}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(comment.created_at).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm text-gray-700">{comment.content}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-4 space-y-2">
                        <Textarea
                          placeholder="Add a comment..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                        />
                        <Button onClick={handleAddComment} disabled={!comment.trim()}>
                          Add Comment
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500">Status</label>
                        <Select value={selectedStatus} onValueChange={handleStatusChange}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="blocked">Blocked</SelectItem>
                            <SelectItem value="on_hold">On Hold</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-gray-500">Assignee</label>
                        <Select value={selectedAssignee} onValueChange={handleAssigneeChange}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select assignee" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">John Doe</SelectItem>
                            <SelectItem value="2">Jane Smith</SelectItem>
                            <SelectItem value="3">Bob Johnson</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Created: {new Date(task.created_at).toLocaleDateString()}</span>
                      </div>

                      {task.due_date && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Clock className="w-4 h-4" />
                          <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                        </div>
                      )}

                      {task.estimated_hours && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Activity className="w-4 h-4" />
                          <span>Estimated: {task.estimated_hours}h</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="activity">
              <Card>
                <CardHeader>
                  <CardTitle>Activity Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {task.activity_log?.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${getStatusColor(activity.type)}`}></div>
                        <div className="flex-1">
                          <p className="text-sm">{activity.description}</p>
                          <span className="text-xs text-gray-500">
                            {new Date(activity.created_at).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="time">
              <Card>
                <CardHeader>
                  <CardTitle>Time Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium">Total Time Logged</span>
                      <span className="text-lg font-bold">
                        {formatDuration(task.total_time_logged || 0)}
                      </span>
                    </div>
                    
                    {timeEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 border rounded">
                        <div>
                          <p className="font-medium">{entry.user?.name}</p>
                          <p className="text-sm text-gray-500">{entry.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{formatDuration(entry.duration)}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(entry.logged_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="dependencies">
              <Card>
                <CardHeader>
                  <CardTitle>Task Dependencies</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Blocked By</h4>
                      {dependencies.blocked_by?.length > 0 ? (
                        <div className="space-y-2">
                          {dependencies.blocked_by.map((dep) => (
                            <div key={dep.id} className="p-3 border rounded flex justify-between">
                              <span>{dep.title}</span>
                              <Badge className={getStatusColor(dep.status)}>
                                {dep.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">No blocking dependencies</p>
                      )}
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Blocks</h4>
                      {dependencies.blocks?.length > 0 ? (
                        <div className="space-y-2">
                          {dependencies.blocks.map((dep) => (
                            <div key={dep.id} className="p-3 border rounded flex justify-between">
                              <span>{dep.title}</span>
                              <Badge className={getStatusColor(dep.status)}>
                                {dep.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500">Not blocking any tasks</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="files">
              <Card>
                <CardHeader>
                  <CardTitle>Attachments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {task.attachments?.length > 0 ? (
                      task.attachments.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="w-4 h-4" />
                            <span>{file.filename}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">{file.size}</span>
                            <Button variant="outline" size="sm">Download</Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No attachments</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>Change History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {task.change_history?.map((change) => (
                      <div key={change.id} className="p-3 border-l-4 border-blue-500 bg-blue-50">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium">{change.field} changed</p>
                            <p className="text-sm text-gray-600">
                              From: <span className="font-mono">{change.old_value}</span>
                            </p>
                            <p className="text-sm text-gray-600">
                              To: <span className="font-mono">{change.new_value}</span>
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <p>{change.user?.name}</p>
                            <p>{new Date(change.created_at).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;