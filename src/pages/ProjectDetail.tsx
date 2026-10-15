import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Edit2, Trash2, Users, Calendar, Paperclip, FileText, Download, Plus, Send, MessageSquare, UserPlus, UserMinus, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { Project, ProjectStatus, ProjectAttachment, ProjectMessage, Task } from '../types';
import { notificationSound } from '../utils/notificationSound';

const statusColors: Record<string, string> = {
  planned: 'bg-gray-100 text-gray-700',
  in_progress: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  on_hold: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-600',
};

const projectStatusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 text-gray-700',
  active: 'bg-green-100 text-green-700',
  on_hold: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  archived: 'bg-gray-100 text-gray-600',
};

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { projects, tasks, updateProject, deleteProject, addProjectMember, removeProjectMember, addTask, updateTask, addMessage, deleteMessage, projectMessages, employees: allEmployees, addNotification } = useData();
  const { employee, isAdmin } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'overview' | 'tasks' | 'chat' | 'team'>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showStatusConfirm, setShowStatusConfirm] = useState<{taskId: string, newStatus: Task['status']} | null>(null);
  const [showRemoveMemberConfirm, setShowRemoveMemberConfirm] = useState<string | null>(null);
  const [editProject, setEditProject] = useState<Project | null>(null);
  const [taskFormErrors, setTaskFormErrors] = useState<Record<string, boolean>>({});
  const [newTask, setNewTask] = useState({
    title: '', description: '', priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    dueDate: '', estimatedHours: 4, assigneeIds: [] as string[]
  });
  const [chatMessage, setChatMessage] = useState('');
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [chatAttachments, setChatAttachments] = useState<ProjectAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);

  const project = projects.find(p => p.id === id);
  const projectTasks = tasks.filter(t => t.projectId === id);
  const projectMsgs = projectMessages.filter(m => m.projectId === id && !m.isDeleted);

  // Calculate project progress based on tasks
  const calculateProgress = () => {
    if (projectTasks.length === 0) return 0;
    const completedTasks = projectTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / projectTasks.length) * 100);
  };

  // Update project progress when tasks change
  useEffect(() => {
    if (project) {
      const newProgress = calculateProgress();
      if (newProgress !== project.progress) {
        updateProject(project.id, { progress: newProgress });
      }
    }
  }, [projectTasks.length, projectTasks.filter(t => t.status === 'completed').length]);

  // Drag and drop handlers for chat
  const [isDragging, setIsDragging] = useState(false);
  const chatDropRef = useRef<HTMLDivElement>(null);

  const handleChatDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleChatDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleChatDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const handleFileUpload = (files: File[]) => {
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const newAttachment: ProjectAttachment = {
          id: `att_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          url: base64,
          uploadedAt: new Date().toISOString(),
          uploadedBy: employee?.id || '',
        };
        setChatAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Delete message handler
  const handleDeleteMessage = (messageId: string) => {
    deleteMessage(messageId);
  };

  // Check if message can be deleted (within 10 minutes)
  const canDeleteMessage = (message: ProjectMessage) => {
    const messageTime = new Date(message.createdAt).getTime();
    const currentTime = new Date().getTime();
    const tenMinutes = 10 * 60 * 1000;
    return (currentTime - messageTime) < tenMinutes;
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [projectMsgs.length]);

  if (!project) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <p className="text-gray-500 mb-4">Project not found</p>
          <button onClick={() => navigate('/projects')} className="btn-primary">Back to Projects</button>
        </div>
      </div>
    );
  }

  const getEmployeeName = (empId: string) => {
    const emp = allEmployees.find(e => e.id === empId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDownloadAttachment = (attachment: ProjectAttachment) => {
    // If we have base64 data, use it
    if (attachment.url && attachment.url.startsWith('data:')) {
      const a = document.createElement('a');
      a.href = attachment.url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Fallback: create a text file with file info
      const content = `File: ${attachment.fileName}\nSize: ${formatFileSize(attachment.fileSize)}\nType: ${attachment.mimeType}\nUploaded: ${attachment.uploadedAt}`;
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = attachment.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleEditProject = () => {
    if (!editProject) return;
    updateProject(editProject.id, editProject);
    setShowEditModal(false);
    setEditProject(null);
  };

  const handleDeleteProject = () => {
    deleteProject(project.id);
    navigate('/projects');
  };

  const handleTaskStatusChange = (taskId: string, newStatus: Task['status']) => {
    setShowStatusConfirm({ taskId, newStatus });
  };

  const confirmStatusChange = () => {
    if (!showStatusConfirm || !employee) return;

    const task = tasks.find(t => t.id === showStatusConfirm.taskId);
    if (!task) return;

    const now = new Date().toISOString();
    const newHistory = [...task.statusHistory, {
      id: `sh_${Date.now()}`,
      fromStatus: task.status,
      toStatus: showStatusConfirm.newStatus,
      changedBy: employee.id,
      changedAt: now,
    }];

    const updates: Partial<Task> = {
      status: showStatusConfirm.newStatus,
      statusHistory: newHistory,
    };

    if (showStatusConfirm.newStatus === 'completed') {
      updates.completedAt = now;
    }

    updateTask(showStatusConfirm.taskId, updates);
    notificationSound.playStatusSound();

    // Notify all project members
    project.members.forEach(m => {
      if (m.employeeId !== employee.id) {
        const emp = allEmployees.find(e => e.id === m.employeeId);
        if (emp) {
          addNotification({
            id: `notif_status_${Date.now()}_${m.employeeId}`,
            userId: emp.userId,
            type: 'task_completed',
            title: 'Task Status Updated',
            message: `"${task.title}" is now ${showStatusConfirm.newStatus.replace('_', ' ')} in ${project.title}`,
            entityId: task.id,
            entityType: 'task',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    setShowStatusConfirm(null);
  };

  const handleCreateTask = () => {
    if (!employee) return;
    
    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!newTask.title.trim()) errors.title = true;
    if (newTask.assigneeIds.length === 0) errors.assigneeIds = true;

    if (Object.keys(errors).length > 0) {
      setTaskFormErrors(errors);
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    const task: Task = {
      id: `t_${Date.now()}`,
      taskId: `TSK${String(tasks.length + 1).padStart(3, '0')}`,
      title: newTask.title,
      description: newTask.description,
      projectId: project.id,
      creatorId: employee.id,
      assigneeIds: newTask.assigneeIds,
      scheduledDate: today,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || undefined,
      estimatedMinutes: newTask.estimatedHours * 60,
      actualMinutes: 0,
      priority: newTask.priority,
      status: 'planned',
      isOverdue: false,
      statusHistory: [{
        id: `sh_${Date.now()}`,
        fromStatus: null,
        toStatus: 'planned',
        changedBy: employee.id,
        changedAt: new Date().toISOString(),
      }],
      timeEntries: [],
    };
    addTask(task);
    notificationSound.playTaskSound();

    // Notify assigned employees
    newTask.assigneeIds.forEach(empId => {
      const emp = allEmployees.find(e => e.id === empId);
      if (emp) {
        addNotification({
          id: `notif_task_${Date.now()}_${empId}`,
          userId: emp.userId,
          type: 'task_assigned',
          title: 'New Task Assigned',
          message: `"${newTask.title}" in ${project.title}`,
          entityId: task.id,
          entityType: 'task',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    setShowTaskModal(false);
    setNewTask({ title: '', description: '', priority: 'medium', dueDate: '', estimatedHours: 4, assigneeIds: [] });
  };

  const handleSendMessage = () => {
    if (!chatMessage.trim() || !employee) return;
    const newMsg: ProjectMessage = {
      id: `msg_${Date.now()}`,
      projectId: project.id,
      senderId: employee.id,
      content: chatMessage,
      replyToId: replyTo || undefined,
      isPinned: false,
      mentions: [],
      attachments: chatAttachments,
      createdAt: new Date().toISOString(),
      isDeleted: false,
    };
    addMessage(newMsg);
    notificationSound.playMessageSound();

    // Notify all project members except sender
    project.members.forEach(m => {
      if (m.employeeId !== employee.id) {
        const emp = allEmployees.find(e => e.id === m.employeeId);
        if (emp) {
          addNotification({
            id: `notif_msg_${Date.now()}_${m.employeeId}`,
            userId: emp.userId,
            type: 'message',
            title: `New message in ${project.title}`,
            message: `${employee.firstName}: ${chatMessage.slice(0, 50)}${chatMessage.length > 50 ? '...' : ''}`,
            entityId: project.id,
            entityType: 'project',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
    });

    setChatMessage('');
    setReplyTo(null);
    setChatAttachments([]);
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        const newAtt: ProjectAttachment = {
          id: `att_${Date.now()}_${Math.random()}`,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          url: base64,
          uploadedAt: new Date().toISOString(),
          uploadedBy: employee?.id || 'e1',
        };
        setChatAttachments(prev => [...prev, newAtt]);
      };
      reader.readAsDataURL(file);
    });
    
    if (chatFileInputRef.current) chatFileInputRef.current.value = '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 rounded-lg">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <span className="text-xs text-gray-400 font-mono">{project.projectId}</span>
            <h1 className="text-2xl font-bold text-gray-900">{project.title}</h1>
          </div>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <button onClick={() => { setEditProject({...project}); setShowEditModal(true); }} className="btn-secondary text-sm flex items-center gap-1">
              <Edit2 className="w-4 h-4" /> Edit
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} className="btn-danger text-sm flex items-center gap-1">
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {(['overview', 'tasks', 'chat', 'team'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              {tab === 'chat' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{projectMsgs.length}</span>}
              {tab === 'tasks' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{projectTasks.length}</span>}
              {tab === 'team' && <span className="ml-1 badge bg-indigo-100 text-indigo-700">{project.members.length}</span>}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            <span className={`badge ${projectStatusColors[project.status]}`}>{project.status.replace('_', ' ')}</span>
            <span className={`badge ${project.priority === 'critical' ? 'bg-red-100 text-red-700' : project.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
              {project.priority} priority
            </span>
          </div>
          <p className="text-gray-600">{project.description}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Start Date</p>
              <p className="text-sm font-semibold">{project.startDate}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Delivery Date</p>
              <p className="text-sm font-semibold">{project.targetDeliveryDate || '—'}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Tasks</p>
              <p className="text-sm font-semibold">{projectTasks.length}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-xs text-gray-500 mb-1">Team Members</p>
              <p className="text-sm font-semibold">{project.members.length}</p>
            </div>
          </div>
          {project.attachments.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Paperclip className="w-4 h-4" /> Attachments ({project.attachments.length})
              </h3>
              <div className="space-y-2">
                {project.attachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <FileText className="w-5 h-5 text-indigo-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{att.fileName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(att.fileSize)} • {new Date(att.uploadedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDownloadAttachment(att)} className="p-2 hover:bg-gray-200 rounded-lg" title="Download">
                      <Download className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tasks' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Tasks ({projectTasks.length})</h3>
            <button onClick={() => setShowTaskModal(true)} className="btn-primary text-sm flex items-center gap-1">
              <Plus className="w-4 h-4" /> Add Task
            </button>
          </div>
          {projectTasks.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No tasks yet. Click "Add Task" to create one.</p>
          ) : (
            <div className="space-y-3">
              {projectTasks.map(task => {
                const lastStatusChange = task.statusHistory[task.statusHistory.length - 1];
                const changedByEmployee = lastStatusChange ? allEmployees.find(e => e.id === lastStatusChange.changedBy) : null;
                
                return (
                  <div key={task.id} className="p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{task.title}</h4>
                        {task.description && <p className="text-sm text-gray-600 mt-1">{task.description}</p>}
                      </div>
                      <select
                        value={task.status}
                        onChange={(e) => handleTaskStatusChange(task.id, e.target.value as Task['status'])}
                        className={`text-xs px-3 py-1 rounded-full font-medium ${statusColors[task.status]}`}
                      >
                        <option value="planned">Planned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                      <div className="flex items-center gap-4">
                        <span>Assigned: {task.assigneeIds.map(id => getEmployeeName(id)).join(', ')}</span>
                        {task.dueDate && <span>Due: {task.dueDate}</span>}
                      </div>
                      <span>{(task.actualMinutes / 60).toFixed(1)}h / {(task.estimatedMinutes / 60).toFixed(1)}h</span>
                    </div>
                    {lastStatusChange && (
                      <div className="text-xs text-gray-400 border-t border-gray-100 pt-2 mt-2">
                        <span className="font-medium">Status changed to {lastStatusChange.toStatus.replace('_', ' ')} by {changedByEmployee?.firstName} {changedByEmployee?.lastName}</span>
                        <span className="ml-2">on {new Date(lastStatusChange.changedAt).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'chat' && (
        <div className="flex flex-col h-[600px] bg-white border border-gray-200 rounded-lg">
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {projectMsgs.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No messages yet. Start the conversation!</p>
            ) : (
              projectMsgs.map(msg => {
                const sender = allEmployees.find(e => e.id === msg.senderId);
                const isCurrentUser = msg.senderId === employee?.id;
                const repliedMsg = msg.replyToId ? projectMsgs.find(m => m.id === msg.replyToId) : null;
                return (
                  <div key={msg.id} className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : ''}`}>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {sender?.firstName?.[0]}{sender?.lastName?.[0]}
                    </div>
                    <div className={`max-w-[70%] flex flex-col ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-700">{sender?.firstName} {sender?.lastName}</span>
                        <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                      {repliedMsg && (
                        <div className="mb-1 px-3 py-1.5 bg-gray-50 rounded-lg border-l-2 border-indigo-300 text-xs text-gray-500">
                          <span className="font-medium">{getEmployeeName(repliedMsg.senderId)}:</span> {repliedMsg.content.slice(0, 60)}...
                        </div>
                      )}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm ${isCurrentUser ? 'bg-indigo-600 text-white rounded-tr-md' : 'bg-gray-100 text-gray-800 rounded-tl-md'}`}>
                        {msg.content}
                      </div>
                      {msg.attachments.length > 0 && (
                        <div className="mt-1 space-y-1">
                          {msg.attachments.map(att => (
                            <button
                              key={att.id}
                              onClick={() => handleDownloadAttachment(att)}
                              className="flex items-center gap-2 px-3 py-1.5 bg-white border border-gray-200 rounded text-xs hover:bg-gray-50"
                            >
                              <FileText className="w-3 h-3 text-indigo-500" />
                              <span>{att.fileName}</span>
                              <Download className="w-3 h-3" />
                            </button>
                          ))}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <button onClick={() => setReplyTo(msg.id)} className="text-xs text-gray-400 hover:text-indigo-600 flex items-center gap-1">
                          <Send className="w-3 h-3" /> Reply
                        </button>
                        {isCurrentUser && canDeleteMessage(msg) && (
                          <button 
                            onClick={() => handleDeleteMessage(msg.id)} 
                            className="text-xs text-gray-400 hover:text-red-600 flex items-center gap-1"
                            title="Delete message (available for 10 minutes)"
                          >
                            <Trash2 className="w-3 h-3" /> Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {replyTo && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
              <span className="text-xs text-gray-500">
                Replying to {getEmployeeName(projectMsgs.find(m => m.id === replyTo)?.senderId || '')}
              </span>
              <button onClick={() => setReplyTo(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <div 
            ref={chatDropRef}
            onDragOver={handleChatDragOver}
            onDragLeave={handleChatDragLeave}
            onDrop={handleChatDrop}
            className={`border-t border-gray-200 p-4 transition-colors ${isDragging ? 'bg-indigo-50 border-indigo-300' : ''}`}
          >
            {isDragging && (
              <div className="mb-2 p-3 bg-indigo-100 border-2 border-dashed border-indigo-400 rounded-lg text-center text-sm text-indigo-700">
                Drop files here to attach
              </div>
            )}
            {chatAttachments.length > 0 && (
              <div className="mb-2 space-y-1">
                {chatAttachments.map(att => (
                  <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {att.fileName}
                    </span>
                    <button onClick={() => setChatAttachments(prev => prev.filter(a => a.id !== att.id))} className="text-red-500">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex items-center gap-2">
              <input type="file" ref={chatFileInputRef} onChange={handleChatFileUpload} multiple className="hidden" />
              <button onClick={() => chatFileInputRef.current?.click()} className="p-2 hover:bg-gray-100 rounded-lg">
                <Paperclip className="w-4 h-4 text-gray-500" />
              </button>
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Type a message or drag & drop files..."
                className="input-field flex-1"
              />
              <button onClick={handleSendMessage} disabled={!chatMessage.trim() && chatAttachments.length === 0} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'team' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">Team Members ({project.members.length})</h3>
            {isAdmin && (
              <button onClick={() => setShowTeamModal(true)} className="btn-primary text-sm flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> Add Member
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {project.members.map(m => {
              const emp = allEmployees.find(e => e.id === m.employeeId);
              const isManager = m.role === 'manager';
              return (
                <div key={m.id} className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                      {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-500">{isManager ? 'Project Manager' : m.role}</p>
                    </div>
                  </div>
                  {isAdmin && !isManager && (
                    <button
                      onClick={() => setShowRemoveMemberConfirm(m.id)}
                      className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                      title="Remove member"
                    >
                      <UserMinus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditModal && editProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowEditModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Edit Project</h2>
              <button onClick={() => setShowEditModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input className="input-field" value={editProject.title} onChange={e => setEditProject({...editProject, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={3} value={editProject.description} onChange={e => setEditProject({...editProject, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="input-field" value={editProject.status} onChange={e => setEditProject({...editProject, status: e.target.value as ProjectStatus})}>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={editProject.priority} onChange={e => setEditProject({...editProject, priority: e.target.value as any})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Delivery</label>
                <input type="date" className="input-field" value={editProject.targetDeliveryDate || ''} onChange={e => setEditProject({...editProject, targetDeliveryDate: e.target.value || undefined})} />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleEditProject} className="btn-primary flex-1">Save Changes</button>
                <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowDeleteConfirm(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Delete Project</h3>
                  <p className="text-sm text-gray-500">This will permanently delete the project and all related data.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleDeleteProject} className="btn-danger flex-1">Delete</button>
                <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTaskModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Task</h2>
              <button onClick={() => setShowTaskModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
                <input 
                  className={`input-field ${taskFormErrors.title ? 'border-red-500 focus:ring-red-500' : ''}`} 
                  value={newTask.title} 
                  onChange={e => {
                    setNewTask({...newTask, title: e.target.value});
                    if (taskFormErrors.title) setTaskFormErrors({...taskFormErrors, title: false});
                  }}
                  placeholder="Enter task title" 
                />
                {taskFormErrors.title && (
                  <p className="text-xs text-red-600 mt-1">Task title is required</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea className="input-field" rows={2} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                  <input type="date" className="input-field" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
                <input type="number" className="input-field" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To *</label>
                <div className={`border rounded-lg max-h-40 overflow-y-auto p-2 space-y-1 ${taskFormErrors.assigneeIds ? 'border-red-500' : 'border-gray-200'}`}>
                  {/* Include current user if they're a team member */}
                  {project.members.filter(m => m.role !== 'manager' || isAdmin).map(m => {
                    const emp = allEmployees.find(e => e.id === m.employeeId);
                    return (
                      <label key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newTask.assigneeIds.includes(m.employeeId)}
                          onChange={() => {
                            setNewTask(prev => ({
                              ...prev,
                              assigneeIds: prev.assigneeIds.includes(m.employeeId)
                                ? prev.assigneeIds.filter(id => id !== m.employeeId)
                                : [...prev.assigneeIds, m.employeeId]
                            }));
                            if (taskFormErrors.assigneeIds) setTaskFormErrors({...taskFormErrors, assigneeIds: false});
                          }}
                          className="rounded text-indigo-600"
                        />
                        <span className="text-sm">{emp?.firstName} {emp?.lastName}</span>
                      </label>
                    );
                  })}
                </div>
                {taskFormErrors.assigneeIds && (
                  <p className="text-xs text-red-600 mt-1">Please assign at least one team member</p>
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateTask} className="btn-primary flex-1">Create Task</button>
                <button onClick={() => setShowTaskModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Team Member Modal */}
      {showTeamModal && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTeamModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Team Member</h2>
              <button onClick={() => setShowTeamModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <div className="space-y-2">
                {allEmployees.filter(e => e.status === 'active' && !project.members.some(m => m.employeeId === e.id)).map(emp => (
                  <div key={emp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                        <p className="text-xs text-gray-500">{emp.designation}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        addProjectMember(project.id, emp.id, 'developer');
                        setShowTeamModal(false);
                      }}
                      className="btn-primary text-xs"
                    >
                      Add
                    </button>
                  </div>
                ))}
                {allEmployees.filter(e => e.status === 'active' && !project.members.some(m => m.employeeId === e.id)).length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">All employees are already team members</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Status Change Confirmation */}
      {showStatusConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowStatusConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Confirm Status Change</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to change the task status to <span className="font-medium">{showStatusConfirm.newStatus.replace('_', ' ')}</span>?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={confirmStatusChange} className="btn-primary flex-1">Confirm</button>
                <button onClick={() => setShowStatusConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Remove Team Member Confirmation */}
      {showRemoveMemberConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowRemoveMemberConfirm(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                  <UserMinus className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Remove Team Member</h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to remove this member from the project?
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (showRemoveMemberConfirm) {
                      removeProjectMember(project.id, showRemoveMemberConfirm);
                      setShowRemoveMemberConfirm(null);
                    }
                  }}
                  className="btn-danger flex-1"
                >
                  Remove
                </button>
                <button onClick={() => setShowRemoveMemberConfirm(null)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
