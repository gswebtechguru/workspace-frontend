import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Clock, CheckCircle2, AlertTriangle, Calendar, Plus, TrendingUp, Bell, FolderKanban, ArrowRight, X } from 'lucide-react';

export default function EmployeeDashboard() {
  const navigate = useNavigate();
  const { employee } = useAuth();
  const { tasks, projects, attendanceRecords, notifications, checkOut, completeTask, getProjectName } = useData();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskProject, setNewTaskProject] = useState('');
  
  const today = new Date().toISOString().split('T')[0];
  
  if (!employee) return null;

  const todayAttendance = attendanceRecords.find(a => a.employeeId === employee.id && a.workDate === today);
  const myTasks = tasks.filter(t => t.assigneeIds.includes(employee.id));
  const todayTasks = myTasks.filter(t => t.scheduledDate === today);
  const overdueTasks = myTasks.filter(t => t.isOverdue && t.status !== 'completed');
  const completedToday = todayTasks.filter(t => t.status === 'completed');
  const inProgress = todayTasks.filter(t => t.status === 'in_progress');
  const myProjects = projects.filter(p => p.members.some(m => m.employeeId === employee.id));
  const totalEstimatedToday = todayTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  const totalActualToday = todayTasks.reduce((s, t) => s + t.actualMinutes, 0);
  const userNotifs = notifications.filter(n => n.userId === employee.userId);
  const unreadNotifs = userNotifs.filter(n => !n.isRead);

  const calculateProgress = (projectId: string) => {
    const pTasks = tasks.filter(t => t.projectId === projectId);
    if (pTasks.length === 0) return 0;
    const completedTasks = pTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / pTasks.length) * 100);
  };

  const handleCheckOut = () => {
    checkOut(employee.id);
  };

  const handleCompleteTask = (taskId: string) => {
    completeTask(taskId);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 17 ? 'Afternoon' : 'Evening'}, {employee.firstName}!</h1>
          <p className="text-sm text-gray-500">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>
        <button onClick={() => navigate('/my-projects')} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> Add Task</button>
      </div>

      {/* Attendance Status */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${todayAttendance?.checkInAt ? 'bg-green-100' : 'bg-gray-100'}`}>
            <Clock className={`w-6 h-6 ${todayAttendance?.checkInAt ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {todayAttendance?.checkInAt ? `Checked in at ${new Date(todayAttendance.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not checked in yet'}
            </p>
            <p className="text-sm text-gray-500">
              {todayAttendance?.checkOutAt ? (
                <>
                  Checked out at {new Date(todayAttendance.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  {todayAttendance.checkInAt && todayAttendance.checkOutAt && (
                    <span className="ml-2 font-medium text-green-600">
                      • Total: {((new Date(todayAttendance.checkOutAt).getTime() - new Date(todayAttendance.checkInAt).getTime()) / 3600000).toFixed(1)} hours
                    </span>
                  )}
                </>
              ) : todayAttendance?.checkInAt ? (
                <>
                  Working • Remember to check out
                  {todayAttendance.checkInAt && (
                    <span className="ml-2 font-medium text-blue-600">
                      • Current: {((new Date().getTime() - new Date(todayAttendance.checkInAt).getTime()) / 3600000).toFixed(1)} hours
                    </span>
                  )}
                </>
              ) : 'Login-based attendance • Auto check-in on first login'}
            </p>
          </div>
        </div>
        {todayAttendance?.checkInAt && !todayAttendance?.checkOutAt && (
          <button onClick={handleCheckOut} className="btn-primary flex items-center gap-2">
            <Clock className="w-4 h-4" /> Check Out
          </button>
        )}
        {todayAttendance?.checkOutAt && (
          <div className="px-4 py-2 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm font-medium text-green-700">✓ Checked Out</p>
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-emerald-600 flex items-center justify-center shadow-sm"><Calendar className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-slate-100">{todayTasks.length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Today's Tasks</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-sm"><CheckCircle2 className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-slate-100">{completedToday.length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Completed</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center shadow-sm"><AlertTriangle className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-slate-100">{overdueTasks.length}</p><p className="text-xs text-gray-500 dark:text-slate-400">Overdue</p></div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center shadow-sm"><TrendingUp className="w-5 h-5 text-white" /></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-slate-100">{(totalActualToday / 60).toFixed(1)}h</p><p className="text-xs text-gray-500 dark:text-slate-400">of {(totalEstimatedToday / 60).toFixed(1)}h planned</p></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Tasks */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Today's Tasks</h3>
            <span className="text-xs text-gray-500">{completedToday.length}/{todayTasks.length} done</span>
          </div>
          <div className="space-y-3">
            {todayTasks.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No tasks planned for today.</p>
                <button onClick={() => setShowAddTask(true)} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2">+ Plan your day</button>
              </div>
            ) : todayTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <button
                  onClick={() => t.status !== 'completed' && handleCompleteTask(t.id)}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                    t.status === 'completed' ? 'bg-green-500 border-green-500' : 'border-gray-300 hover:border-green-500'
                  }`}>
                  {t.status === 'completed' && <CheckCircle2 className="w-3 h-3 text-white" />}
                </button>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${t.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'}`}>{t.title}</p>
                  <p className="text-xs text-gray-500">{getProjectName(t.projectId)} • Est: {(t.estimatedMinutes / 60).toFixed(1)}h</p>
                </div>
                <div className="flex items-center gap-2">
                  {t.isOverdue && t.status !== 'completed' && <span className="badge bg-red-100 text-red-700">Overdue</span>}
                  <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : t.status === 'on_hold' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {t.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Projects */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2"><Bell className="w-4 h-4" /> Notifications</h3>
              {unreadNotifs.length > 0 && <span className="badge bg-red-100 text-red-700">{unreadNotifs.length} new</span>}
            </div>
            <div className="space-y-2">
              {userNotifs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No notifications</p>
              ) : userNotifs.slice(0, 5).map(n => (
                <div key={n.id} className={`p-2.5 rounded-lg text-sm ${!n.isRead ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-gray-50 dark:bg-slate-700'}`}>
                  <p className={`text-xs ${!n.isRead ? 'font-bold text-gray-900 dark:text-slate-100' : 'font-medium text-gray-700 dark:text-slate-300'}`}>{n.title}</p>
                  <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* My Projects */}
          <div className="card p-5">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3"><FolderKanban className="w-4 h-4" /> My Projects</h3>
            <div className="space-y-2">
              {myProjects.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-slate-400 text-center py-4">No projects assigned</p>
              ) : myProjects.map(p => (
                <div key={p.id} className="p-2.5 bg-gray-50 dark:bg-slate-700 rounded-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 dark:text-slate-100 truncate">{p.title}</p>
                    <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">{calculateProgress(p.id)}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-400 to-green-600 rounded-full" style={{ width: `${calculateProgress(p.id)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Overdue Tasks Alert */}
      {overdueTasks.length > 0 && (
        <div className="card p-5 border-l-4 border-l-red-500">
          <h3 className="font-semibold text-red-800 flex items-center gap-2 mb-3"><AlertTriangle className="w-5 h-5" /> Overdue Tasks ({overdueTasks.length})</h3>
          <div className="space-y-2">
            {overdueTasks.map(t => (
              <div key={t.id} className="flex items-center justify-between p-2 bg-red-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{t.title}</p>
                  <p className="text-xs text-gray-500">{getProjectName(t.projectId)} • Due: {t.dueDate || t.scheduledDate}</p>
                </div>
                <button onClick={() => handleCompleteTask(t.id)} className="text-xs text-red-600 font-medium hover:text-red-800">Mark Done</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Task Modal */}
      {showAddTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowAddTask(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Add Today's Task</h2>
              <button onClick={() => setShowAddTask(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
                <input className="input-field" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="What do you plan to work on?" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                <select className="input-field" value={newTaskProject} onChange={e => setNewTaskProject(e.target.value)}>
                  <option value="">Select project</option>
                  {myProjects.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setShowAddTask(false); setNewTaskTitle(''); setNewTaskProject(''); }} className="btn-primary flex-1">Add Task</button>
                <button onClick={() => setShowAddTask(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
