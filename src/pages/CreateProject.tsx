import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { Project, ProjectAttachment } from '../types';

export default function CreateProject() {
  const navigate = useNavigate();
  const { addProject, projects, employees: allEmployees, addNotification } = useData();
  const { employee } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [attachments, setAttachments] = useState<ProjectAttachment[]>([]);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high' | 'critical',
    startDate: '',
    targetDeliveryDate: '',
    technologyStack: '',
    memberIds: [] as string[]
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const newAtts: ProjectAttachment[] = Array.from(files).map(f => ({
      id: `att_${Date.now()}_${Math.random()}`,
      fileName: f.name,
      fileSize: f.size,
      mimeType: f.type || 'application/octet-stream',
      uploadedAt: new Date().toISOString(),
      uploadedBy: employee?.id || 'e1',
    }));
    setAttachments(prev => [...prev, ...newAtts]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const newAtts: ProjectAttachment[] = Array.from(files).map(f => ({
        id: `att_${Date.now()}_${Math.random()}`,
        fileName: f.name,
        fileSize: f.size,
        mimeType: f.type || 'application/octet-stream',
        uploadedAt: new Date().toISOString(),
        uploadedBy: employee?.id || 'e1',
      }));
      setAttachments(prev => [...prev, ...newAtts]);
    }
  };

  const handleCreateProject = () => {
    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!newProject.title.trim()) errors.title = true;
    if (!newProject.startDate) errors.startDate = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    if (!employee) return;

    const today = new Date().toISOString().split('T')[0];
    const allMembers = [
      { id: `pm_${Date.now()}_mgr`, employeeId: employee.id, role: 'manager' as const, joinedAt: today },
      ...newProject.memberIds.map((id, i) => ({
        id: `pm_${Date.now()}_${i}`,
        employeeId: id,
        role: 'developer' as const,
        joinedAt: today
      }))
    ];

    const project: Project = {
      id: `p_${Date.now()}`,
      projectId: `PRJ${String(projects.length + 1).padStart(3, '0')}`,
      title: newProject.title,
      description: newProject.description,
      technologyStack: newProject.technologyStack ? newProject.technologyStack.split(',').map(t => t.trim()) : [],
      projectManagerId: employee.id,
      members: allMembers,
      startDate: newProject.startDate,
      targetDeliveryDate: newProject.targetDeliveryDate || undefined,
      priority: newProject.priority,
      status: 'planning',
      milestones: [],
      estimatedHours: 0,
      actualHours: 0,
      progress: 0,
      attachments: attachments,
      createdAt: today,
      updatedAt: today,
    };

    addProject(project);

    // Notify assigned employees
    newProject.memberIds.forEach(empId => {
      const emp = allEmployees.find(e => e.id === empId);
      if (emp) {
        addNotification({
          id: `notif_${Date.now()}_${empId}`,
          userId: emp.userId,
          type: 'project_update',
          title: 'New Project Assignment',
          message: `You have been assigned to "${newProject.title}"`,
          entityId: project.id,
          entityType: 'project',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });

    navigate(`/projects/${project.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/projects')} className="p-2 hover:bg-gray-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-sm text-gray-500">Fill in the details to create a new project</p>
        </div>
      </div>

      <div className="card p-6 space-y-6">
        {/* Basic Info */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
          <input
            className={`input-field ${formErrors.title ? 'border-red-500 focus:ring-red-500' : ''}`}
            value={newProject.title}
            onChange={e => {
              setNewProject({...newProject, title: e.target.value});
              if (formErrors.title) setFormErrors({...formErrors, title: false});
            }}
            placeholder="Enter project title"
          />
          {formErrors.title && (
            <p className="text-xs text-red-600 mt-1">Project title is required</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            className="input-field"
            rows={3}
            value={newProject.description}
            onChange={e => setNewProject({...newProject, description: e.target.value})}
            placeholder="Project description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
            <input
              type="date"
              className={`input-field ${formErrors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
              value={newProject.startDate}
              onChange={e => {
                setNewProject({...newProject, startDate: e.target.value});
                if (formErrors.startDate) setFormErrors({...formErrors, startDate: false});
              }}
            />
            {formErrors.startDate && (
              <p className="text-xs text-red-600 mt-1">Start date is required</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Date (Optional)</label>
            <input
              type="date"
              className="input-field"
              value={newProject.targetDeliveryDate}
              onChange={e => setNewProject({...newProject, targetDeliveryDate: e.target.value})}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
          <select
            className="input-field"
            value={newProject.priority}
            onChange={e => setNewProject({...newProject, priority: e.target.value as any})}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technology Stack</label>
          <input
            className="input-field"
            value={newProject.technologyStack}
            onChange={e => setNewProject({...newProject, technologyStack: e.target.value})}
            placeholder="React, Laravel, MySQL (comma separated)"
          />
        </div>

        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> You will be automatically assigned as the Project Manager.
          </p>
        </div>

        {/* Assign Team Members */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Assign Team Members</label>
          <div className="border border-gray-200 rounded-lg max-h-64 overflow-y-auto p-2 space-y-1">
            {allEmployees.filter(e => e.id !== employee?.id && e.status === 'active').map(emp => (
              <label key={emp.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer">
                <input
                  type="checkbox"
                  checked={newProject.memberIds.includes(emp.id)}
                  onChange={() => setNewProject(prev => ({
                    ...prev,
                    memberIds: prev.memberIds.includes(emp.id)
                      ? prev.memberIds.filter(id => id !== emp.id)
                      : [...prev.memberIds, emp.id]
                  }))}
                  className="rounded text-indigo-600"
                />
                <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{emp.firstName} {emp.lastName}</p>
                  <p className="text-xs text-gray-500">{emp.designation}</p>
                </div>
              </label>
            ))}
          </div>
          {newProject.memberIds.length > 0 && (
            <p className="text-xs text-gray-500 mt-2">
              {newProject.memberIds.length} member{newProject.memberIds.length > 1 ? 's' : ''} selected
            </p>
          )}
        </div>

        {/* Upload Project Materials */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Materials</label>
          <div
            className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
              isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="hidden" />
            <Upload className={`w-10 h-10 mx-auto mb-3 ${isDragging ? 'text-indigo-500' : 'text-gray-400'}`} />
            <p className="text-sm text-gray-600">
              {isDragging ? 'Drop files here...' : 'Click to upload files or drag and drop'}
            </p>
            <p className="text-xs text-gray-400 mt-1">PDF, DOC, XLS, Images, ZIP (max 10MB each)</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-3 text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Browse Files
            </button>
          </div>
          {attachments.length > 0 && (
            <div className="mt-3 space-y-2">
              {attachments.map(att => (
                <div key={att.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                  <span className="text-sm">{att.fileName}</span>
                  <button
                    onClick={() => setAttachments(prev => prev.filter(a => a.id !== att.id))}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button onClick={handleCreateProject} className="btn-primary flex-1">
            Create Project
          </button>
          <button onClick={() => navigate('/projects')} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
