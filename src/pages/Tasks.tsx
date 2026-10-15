import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Search, Plus, AlertTriangle, CheckCircle2, Clock, Calendar, XCircle, Pause, X } from 'lucide-react';
import { Task, TaskStatus } from '../types';

const statusConfig: Record<TaskStatus, { color: string }> = {
  planned: { color: 'bg-gray-100 text-gray-700' },
  in_progress: { color: 'bg-blue-100 text-blue-700' },
  completed: { color: 'bg-green-100 text-green-700' },
  on_hold: { color: 'bg-amber-100 text-amber-700' },
  cancelled: { color: 'bg-red-100 text-red-700' },
};

export default function Tasks() {
  const { tasks, projects, employees, addTask, completeTask, reopenTask, addTimeEntry, getEmployeeName, getProjectName } = useData();
  const { employee } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showReopenModal, setShowReopenModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [timeEntry, setTimeEntry] = useState({ minutes: 0, description: '' });
  const [newTask, setNewTask] = useState({ title: '', description: '', projectId: '', priority: 'medium' as const, dueDate: '', estimatedHours: 4, assigneeId: '' });

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || t.status === statusFilter;
    const matchProject = !projectFilter || t.projectId === projectFilter;
    return matchSearch && matchStatus && matchProject;
  });

  const kanbanColumns: TaskStatus[] = ['planned', 'in_progress', 'on_hold', 'completed'];

  const handleCreateTask = () => {
    if (!newTask.title || !newTask.projectId) return;
    const today = new Date().toISOString().split('T')[0];
    const task: Task = {
      id: `t_${Date.now()}`,
      taskId: `TSK${String(tasks.length + 1).padStart(3, '0')}`,
      title: newTask.title,
      description: newTask.description,
      projectId: newTask.projectId,
      creatorId: employee?.id || 'e1',
      assigneeIds: [newTask.assigneeId || employee?.id || 'e1'],
      scheduledDate: today,
      createdAt: new Date().toISOString(),
      dueDate: newTask.dueDate || today,
      estimatedMinutes: newTask.estimatedHours * 60,
      actualMinutes: 0,
      priority: newTask.priority,
      status: 'planned',
      isOverdue: false,
      statusHistory: [{ id: `sh_${Date.now()}`, fromStatus: null, toStatus: 'planned', changedBy: employee?.id || 'e1', changedAt: new Date().toISOString() }],
      timeEntries: [],
    };
    addTask(task);
    setShowCreateModal(false);
    setNewTask({ title: '', description: '', projectId: '', priority: 'medium', dueDate: '', estimatedHours: 4, assigneeId: '' });
  };

  const handleComplete = (taskId: string) => {
    completeTask(taskId);
    if (selectedTask?.id === taskId) {
      setSelectedTask(prev => prev ? { ...prev, status: 'completed', completedAt: new Date().toISOString() } : null);
    }
  };

  const handleReopen = () => {
    if (!selectedTask || !reopenReason) return;
    reopenTask(selectedTask.id, reopenReason);
    setShowReopenModal(false);
    setReopenReason('');
    setSelectedTask(prev => prev ? { ...prev, status: 'in_progress', completedAt: undefined } : null);
  };

  const handleAddTime = () => {
    if (!selectedTask || timeEntry.minutes <= 0) return;
    const entry = {
      id: `te_${Date.now()}`,
      taskId: selectedTask.id,
      employeeId: employee?.id || 'e1',
      workDate: new Date().toISOString().split('T')[0],
      durationMinutes: timeEntry.minutes,
      description: timeEntry.description,
      createdAt: new Date().toISOString(),
    };
    addTimeEntry(entry);
    setShowTimeModal(false);
    setTimeEntry({ minutes: 0, description: '' });
    setSelectedTask(prev => prev ? { ...prev, actualMinutes: prev.actualMinutes + timeEntry.minutes, timeEntries: [...prev.timeEntries, entry] } : null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tasks</h1>
          <p className="text-sm text-gray-500">{filtered.length} tasks • {tasks.filter(t => t.isOverdue && t.status !== 'completed').length} overdue</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>List</button>
            <button onClick={() => setViewMode('kanban')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'kanban' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Kanban</button>
          </div>
          <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Task</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search tasks..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="planned">Planned</option><option value="in_progress">In Progress</option>
          <option value="completed">Completed</option><option value="on_hold">On Hold</option>
        </select>
        <select value={projectFilter} onChange={e => setProjectFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Projects</option>
          {projects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
        </select>
      </div>

      {viewMode === 'list' ? (
        <div className="card overflow-hidden">
          {filtered.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No tasks found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Task</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 hidden md:table-cell">Project</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Assignee</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 hidden sm:table-cell">Due</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-500 hidden lg:table-cell">Time</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(t => (
                    <tr key={t.id} onClick={() => setSelectedTask(t)} className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          {t.isOverdue && t.status !== 'completed' && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                          <div>
                            <p className="font-medium text-gray-900">{t.title}</p>
                            <p className="text-xs text-gray-400">{t.taskId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-600 hidden md:table-cell">{getProjectName(t.projectId)}</td>
                      <td className="py-3 px-4 text-gray-600 hidden lg:table-cell">{t.assigneeIds.map(id => getEmployeeName(id)).join(', ')}</td>
                      <td className="py-3 px-4"><span className={`badge ${statusConfig[t.status].color}`}>{t.status.replace('_', ' ')}</span></td>
                      <td className="py-3 px-4 hidden sm:table-cell">
                        <span className={t.isOverdue && t.status !== 'completed' ? 'text-red-600 font-medium' : 'text-gray-600'}>{t.dueDate || t.scheduledDate}</span>
                      </td>
                      <td className="py-3 px-4 text-gray-600 text-xs hidden lg:table-cell">
                        {(t.actualMinutes / 60).toFixed(1)}h / {(t.estimatedMinutes / 60).toFixed(1)}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map(status => {
            const colTasks = filtered.filter(t => t.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${statusConfig[status].color}`}>{status.replace('_', ' ')}</span>
                  <span className="text-xs text-gray-400">{colTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {colTasks.map(t => (
                    <div key={t.id} onClick={() => setSelectedTask(t)} className="card p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2">{t.title}</p>
                        {t.isOverdue && t.status !== 'completed' && <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />}
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{getProjectName(t.projectId)}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-1">
                          {t.assigneeIds.slice(0, 3).map(id => {
                            const emp = employees.find(e => e.id === id);
                            return <div key={id} className="w-6 h-6 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-700">{emp?.firstName?.[0]}</div>;
                          })}
                        </div>
                        <span className="text-xs text-gray-400">{t.dueDate || t.scheduledDate}</span>
                      </div>
                    </div>
                  ))}
                  {colTasks.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No tasks</p>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="text-xs text-gray-400 font-mono">{selectedTask.taskId}</span>
                <h2 className="text-lg font-semibold">{selectedTask.title}</h2>
              </div>
              <button onClick={() => setSelectedTask(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap gap-2">
                <span className={`badge ${statusConfig[selectedTask.status].color}`}>{selectedTask.status.replace('_', ' ')}</span>
                {selectedTask.isOverdue && selectedTask.status !== 'completed' && <span className="badge bg-red-100 text-red-700">⚠ Overdue</span>}
                <span className={`badge ${selectedTask.priority === 'critical' ? 'bg-red-100 text-red-700' : selectedTask.priority === 'high' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>{selectedTask.priority} priority</span>
              </div>

              {selectedTask.description && <p className="text-sm text-gray-600">{selectedTask.description}</p>}

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Project</p><p className="text-sm font-medium">{getProjectName(selectedTask.projectId)}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Scheduled</p><p className="text-sm font-medium">{selectedTask.scheduledDate}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Due Date</p><p className="text-sm font-medium">{selectedTask.dueDate || '—'}</p></div>
                <div className="p-3 bg-gray-50 rounded-lg"><p className="text-xs text-gray-500">Completed</p><p className="text-sm font-medium">{selectedTask.completedAt ? new Date(selectedTask.completedAt).toLocaleDateString() : '—'}</p></div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-blue-50 rounded-lg"><p className="text-xs text-blue-600">Estimated Time</p><p className="text-lg font-bold text-blue-700">{(selectedTask.estimatedMinutes / 60).toFixed(1)}h</p></div>
                <div className="p-3 bg-green-50 rounded-lg"><p className="text-xs text-green-600">Actual Time</p><p className="text-lg font-bold text-green-700">{(selectedTask.actualMinutes / 60).toFixed(1)}h</p></div>
              </div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Assignees</p>
                <div className="flex flex-wrap gap-2">
                  {selectedTask.assigneeIds.map(id => {
                    const emp = employees.find(e => e.id === id);
                    return <span key={id} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm"><span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{emp?.firstName?.[0]}</span>{emp?.firstName} {emp?.lastName}</span>;
                  })}
                </div>
              </div>

              {selectedTask.blockerReason && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <p className="text-sm font-medium text-amber-800">⚠ Blocker</p>
                  <p className="text-sm text-amber-700 mt-1">{selectedTask.blockerReason}</p>
                </div>
              )}

              {/* Status History */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Status History</p>
                <div className="space-y-2">
                  {selectedTask.statusHistory.map(sh => (
                    <div key={sh.id} className="flex items-center gap-3 text-sm">
                      <div className="w-2 h-2 rounded-full bg-indigo-400" />
                      <span className="text-gray-600">{sh.fromStatus || 'Created'} → <span className="font-medium">{sh.toStatus.replace('_', ' ')}</span></span>
                      {sh.reason && <span className="text-xs text-amber-600">({sh.reason})</span>}
                      <span className="text-gray-400 text-xs ml-auto">{new Date(sh.changedAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Time Entries */}
              {selectedTask.timeEntries.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Time Entries</p>
                  <div className="space-y-2">
                    {selectedTask.timeEntries.map(te => (
                      <div key={te.id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm">
                        <span className="text-gray-600">{te.workDate}</span>
                        <span className="font-medium">{(te.durationMinutes / 60).toFixed(1)}h</span>
                        {te.description && <span className="text-gray-400 text-xs truncate ml-2">{te.description}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                {selectedTask.status !== 'completed' && (
                  <button onClick={() => handleComplete(selectedTask.id)} className="btn-primary flex-1">Mark Complete</button>
                )}
                {selectedTask.status === 'completed' && (
                  <button onClick={() => setShowReopenModal(true)} className="btn-secondary flex-1">Reopen Task</button>
                )}
                <button onClick={() => setShowTimeModal(true)} className="btn-secondary flex-1">Add Time Entry</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reopen Modal */}
      {showReopenModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowReopenModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Reopen Task</h2>
              <p className="text-sm text-gray-500 mt-1">Please provide a reason for reopening this task.</p>
            </div>
            <div className="p-6 space-y-4">
              <textarea className="input-field" rows={3} value={reopenReason} onChange={e => setReopenReason(e.target.value)} placeholder="Reason for reopening..." />
              <div className="flex gap-3">
                <button onClick={handleReopen} disabled={!reopenReason.trim()} className="btn-primary flex-1 disabled:opacity-50">Reopen</button>
                <button onClick={() => setShowReopenModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Time Entry Modal */}
      {showTimeModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50" onClick={() => setShowTimeModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">Add Time Entry</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                <input type="number" className="input-field" value={timeEntry.minutes || ''} onChange={e => setTimeEntry({...timeEntry, minutes: parseInt(e.target.value) || 0})} placeholder="60" min="1" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description (optional)</label>
                <textarea className="input-field" rows={2} value={timeEntry.description} onChange={e => setTimeEntry({...timeEntry, description: e.target.value})} placeholder="What did you work on?" />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddTime} disabled={timeEntry.minutes <= 0} className="btn-primary flex-1 disabled:opacity-50">Save Entry</button>
                <button onClick={() => setShowTimeModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Create New Task</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title *</label><input className="input-field" value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task title" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Description</label><textarea className="input-field" rows={3} value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Task description" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
                  <select className="input-field" value={newTask.projectId} onChange={e => setNewTask({...newTask, projectId: e.target.value})}>
                    <option value="">Select project</option>
                    {projects.filter(p => p.status === 'active').map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select className="input-field" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value as any})}>
                    <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
                  </select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label><input className="input-field" type="date" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label><input className="input-field" type="number" value={newTask.estimatedHours} onChange={e => setNewTask({...newTask, estimatedHours: parseInt(e.target.value) || 0})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select className="input-field" value={newTask.assigneeId} onChange={e => setNewTask({...newTask, assigneeId: e.target.value})}>
                  <option value="">Self</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
                </select></div>
              <div className="flex gap-3 pt-2">
                <button onClick={handleCreateTask} disabled={!newTask.title || !newTask.projectId} className="btn-primary flex-1 disabled:opacity-50">Create Task</button>
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
