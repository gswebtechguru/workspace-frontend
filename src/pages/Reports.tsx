import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar } from 'lucide-react';

export default function Reports() {
  const { employee } = useAuth();
  const { dailyReports, tasks, projects: allProjects, employees: allEmployees, getProjectName } = useData();
  const [activeTab, setActiveTab] = useState<'daily' | 'project' | 'history'>('daily');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  if (!employee) return null;

  const isAdmin = employee.role === 'admin';

  // Filter data based on user role
  const userDailyReports = isAdmin 
    ? dailyReports 
    : dailyReports.filter(r => r.employeeId === employee.id);

  const userProjects = isAdmin 
    ? allProjects 
    : allProjects.filter(p => p.members.some(m => m.employeeId === employee.id));

  const userTasks = isAdmin 
    ? tasks 
    : tasks.filter(t => t.assigneeIds.includes(employee.id));

  const calculateProgress = (projectId: string) => {
    const pTasks = tasks.filter(t => t.projectId === projectId);
    if (pTasks.length === 0) return 0;
    const completedTasks = pTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / pTasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? 'Reports' : 'My Work History'}
          </h1>
          <p className="text-sm text-gray-500">
            {isAdmin 
              ? 'Daily work reports, project analytics, and historical records' 
              : 'Your daily work reports, assigned projects, and task history'}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab('daily')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'daily' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          {isAdmin ? 'Daily Reports' : 'My Daily Reports'}
        </button>
        <button onClick={() => setActiveTab('project')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'project' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          {isAdmin ? 'Project Reports' : 'My Projects'}
        </button>
        <button onClick={() => setActiveTab('history')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'history' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>
          {isAdmin ? 'Work History' : 'My Tasks'}
        </button>
      </div>

      {activeTab === 'daily' && (
        <div className="space-y-4">
          {/* Employee filter - only for admins */}
          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="input-field w-auto">
                <option value="">All Employees</option>
                {allEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
          )}

          {userDailyReports.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">
                {isAdmin ? 'No daily reports generated yet.' : 'You have no daily reports yet.'}
              </p>
              <p className="text-xs text-gray-400 mt-2">Reports are generated automatically at the reporting cutoff time.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {userDailyReports.filter(r => !selectedEmployee || r.employeeId === selectedEmployee).map(report => {
                const emp = allEmployees.find(e => e.id === report.employeeId);
                const completedItems = report.items.filter(i => i.statusAtCutoff === 'completed').length;
                const pendingItems = report.items.filter(i => i.statusAtCutoff !== 'completed' && i.statusAtCutoff !== 'cancelled').length;
                const totalEstimated = report.items.reduce((sum, i) => sum + i.estimatedMinutes, 0);
                const totalActual = report.items.reduce((sum, i) => sum + i.actualMinutes, 0);
                return (
                  <div key={report.id} className="card p-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{emp?.firstName} {emp?.lastName}</h3>
                          <p className="text-xs text-gray-500">{report.reportDate} • Generated at {new Date(report.generatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${report.isComplete ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                          {report.isComplete ? 'Complete' : 'Incomplete'}
                        </span>
                        <span className="badge bg-blue-100 text-blue-700">{report.attendanceStatus}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div className="p-2 bg-green-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-green-700">{completedItems}</p>
                        <p className="text-xs text-green-600">Completed</p>
                      </div>
                      <div className="p-2 bg-amber-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-amber-700">{pendingItems}</p>
                        <p className="text-xs text-amber-600">Pending</p>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-blue-700">{(totalEstimated / 60).toFixed(1)}h</p>
                        <p className="text-xs text-blue-600">Estimated</p>
                      </div>
                      <div className="p-2 bg-purple-50 rounded-lg text-center">
                        <p className="text-lg font-bold text-purple-700">{(totalActual / 60).toFixed(1)}h</p>
                        <p className="text-xs text-purple-600">Actual</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {report.items.map(item => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.statusAtCutoff === 'completed' ? 'bg-green-500' : item.statusAtCutoff === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{item.taskTitle}</p>
                            <p className="text-xs text-gray-500">{item.projectName}</p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className={`badge ${item.statusAtCutoff === 'completed' ? 'bg-green-100 text-green-700' : item.statusAtCutoff === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                              {item.statusAtCutoff.replace('_', ' ')}
                            </span>
                            {item.isCarriedForward && <span className="badge bg-amber-100 text-amber-700">Carried</span>}
                            <span className="text-xs text-gray-500">{(item.actualMinutes / 60).toFixed(1)}h / {(item.estimatedMinutes / 60).toFixed(1)}h</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'project' && (
        <div className="space-y-4">
          {userProjects.length === 0 ? (
            <div className="card p-12 text-center">
              <p className="text-gray-500">
                {isAdmin ? 'No projects found.' : 'You are not assigned to any projects yet.'}
              </p>
            </div>
          ) : (
            userProjects.map(p => {
              const pTasks = tasks.filter(t => t.projectId === p.id);
              const completed = pTasks.filter(t => t.status === 'completed').length;
              const overdue = pTasks.filter(t => t.isOverdue && t.status !== 'completed').length;
              const totalEstimated = pTasks.reduce((s, t) => s + t.estimatedMinutes, 0);
              const totalActual = pTasks.reduce((s, t) => s + t.actualMinutes, 0);
              return (
                <div key={p.id} className="card p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-gray-900">{p.title}</h3>
                      <p className="text-xs text-gray-500">{p.projectId} • {p.status}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-indigo-600">{calculateProgress(p.id)}%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    <div className="p-2 bg-gray-50 rounded-lg text-center"><p className="text-lg font-bold">{pTasks.length}</p><p className="text-xs text-gray-500">Total Tasks</p></div>
                    <div className="p-2 bg-green-50 rounded-lg text-center"><p className="text-lg font-bold text-green-700">{completed}</p><p className="text-xs text-green-600">Completed</p></div>
                    <div className="p-2 bg-red-50 rounded-lg text-center"><p className="text-lg font-bold text-red-700">{overdue}</p><p className="text-xs text-red-600">Overdue</p></div>
                    <div className="p-2 bg-blue-50 rounded-lg text-center"><p className="text-lg font-bold text-blue-700">{(totalEstimated / 60).toFixed(0)}h</p><p className="text-xs text-blue-600">Estimated</p></div>
                    <div className="p-2 bg-purple-50 rounded-lg text-center"><p className="text-lg font-bold text-purple-700">{(totalActual / 60).toFixed(0)}h</p><p className="text-xs text-purple-600">Actual</p></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-4">
          {/* Filters - only for admins */}
          {isAdmin && (
            <div className="flex flex-wrap gap-3">
              <select value={selectedEmployee} onChange={e => setSelectedEmployee(e.target.value)} className="input-field w-auto">
                <option value="">All Employees</option>
                {allEmployees.map(e => <option key={e.id} value={e.id}>{e.firstName} {e.lastName}</option>)}
              </select>
            </div>
          )}

          {/* Continuously scrollable history */}
          <div className="space-y-6">
            {['2024-03-15', '2024-03-14', '2024-03-13'].map(date => {
              // Filter tasks based on user role
              const filteredTasks = userTasks
                .filter(t => t.scheduledDate <= date)
                .filter(t => !selectedEmployee || t.assigneeIds.includes(selectedEmployee));

              if (filteredTasks.length === 0) return null;

              return (
                <div key={date}>
                  <div className="flex items-center gap-3 mb-3">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <h3 className="text-sm font-semibold text-gray-700">{date}</h3>
                    <span className="badge bg-green-100 text-green-700">Present</span>
                    <span className="text-xs text-gray-400">09:00 - 18:05 (9.1h)</span>
                  </div>
                  <div className="ml-7 space-y-2 border-l-2 border-gray-100 pl-4">
                    {filteredTasks.slice(0, 4).map(t => (
                      <div key={t.id} className="flex items-center gap-3 p-3 bg-white border border-gray-100 rounded-lg">
                        <div className={`w-2 h-2 rounded-full ${t.status === 'completed' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : 'bg-gray-400'}`} />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{t.title}</p>
                          <p className="text-xs text-gray-500">{getProjectName(t.projectId)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`badge ${t.status === 'completed' ? 'bg-green-100 text-green-700' : t.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>{t.status.replace('_', ' ')}</span>
                          <span className="text-xs text-gray-500">{(t.actualMinutes / 60).toFixed(1)}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            
            {/* Empty state */}
            {userTasks.length === 0 && (
              <div className="card p-12 text-center">
                <p className="text-gray-500">
                  {isAdmin ? 'No tasks found.' : 'You have no tasks assigned yet.'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
