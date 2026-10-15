import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Users, FolderKanban, CheckSquare, Clock, AlertTriangle, FileWarning, ArrowUpRight, ArrowDownRight, BarChart3, Calendar, Target } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { DateFilter } from '../types';

const dateFilters: { value: DateFilter; label: string }[] = [
  { value: 'today', label: 'Today' }, { value: 'this_week', label: 'This Week' },
  { value: 'this_month', label: 'This Month' }, { value: 'last_month', label: 'Last Month' },
];

const weeklyCompletion = [
  { day: 'Mon', completed: 8, planned: 10 }, { day: 'Tue', completed: 12, planned: 11 },
  { day: 'Wed', completed: 9, planned: 12 }, { day: 'Thu', completed: 14, planned: 13 },
  { day: 'Fri', completed: 11, planned: 14 }, { day: 'Sat', completed: 3, planned: 4 },
  { day: 'Sun', completed: 0, planned: 0 },
];

// Chart colors - Green theme
const CHART_COLORS = {
  primary: '#10b981',
  secondary: '#14b8a6',
  accent: '#22c55e',
};

function getDateRange(filter: DateFilter): { start: Date; end: Date } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (filter) {
    case 'today':
      return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
    case 'this_week':
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay());
      return { start: weekStart, end: new Date(weekStart.getTime() + 7 * 86400000 - 1) };
    case 'this_month':
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { start: monthStart, end: monthEnd };
    case 'last_month':
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start: lastMonthStart, end: lastMonthEnd };
    default:
      return { start: today, end: new Date(today.getTime() + 86400000 - 1) };
  }
}

export default function AdminDashboard() {
  const { tasks, projects, attendanceRecords, leaveRequests, employees } = useData();
  const allEmployees = employees;
  const [dateFilter, setDateFilter] = useState<DateFilter>('today');
  
  const dateRange = useMemo(() => getDateRange(dateFilter), [dateFilter]);

  const calculateProgress = (projectId: string) => {
    const pTasks = tasks.filter(t => t.projectId === projectId);
    if (pTasks.length === 0) return 0;
    const completedTasks = pTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / pTasks.length) * 100);
  };
  
  // Filter tasks by date range
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const taskDate = new Date(t.scheduledDate);
      return taskDate >= dateRange.start && taskDate <= dateRange.end;
    });
  }, [tasks, dateRange]);

  // Filter attendance by date range
  const filteredAttendance = useMemo(() => {
    return attendanceRecords.filter(a => {
      const attDate = new Date(a.workDate);
      return attDate >= dateRange.start && attDate <= dateRange.end;
    });
  }, [attendanceRecords, dateRange]);

  // Calculate metrics dynamically based on filtered data
  const presentCount = filteredAttendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  const notCheckedIn = allEmployees.filter(e => e.status === 'active').length - filteredAttendance.length;
  
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;
  const delayedProjects = projects.filter(p => p.status === 'active' && p.targetDeliveryDate && new Date(p.targetDeliveryDate) < new Date()).length;
  
  const completedTasks = filteredTasks.filter(t => t.status === 'completed').length;
  const overdueTasks = filteredTasks.filter(t => t.isOverdue && t.status !== 'completed').length;
  const blockedTasks = filteredTasks.filter(t => t.status === 'on_hold').length;
  const plannedTasks = filteredTasks.filter(t => t.status === 'planned').length;
  
  const pendingLeave = leaveRequests.filter(l => l.status === 'pending').length;

  const taskStatusData = [
    { name: 'Completed', value: completedTasks, color: '#10b981' },
    { name: 'In Progress', value: filteredTasks.filter(t => t.status === 'in_progress').length, color: '#14b8a6' },
    { name: 'Planned', value: plannedTasks, color: '#f59e0b' },
    { name: 'Blocked', value: blockedTasks, color: '#ef4444' },
    { name: 'Overdue', value: overdueTasks, color: '#dc2626' },
  ].filter(d => d.value > 0);

  const projectProgress = projects.map(p => ({
    name: p.title.length > 12 ? p.title.slice(0, 12) + '...' : p.title,
    estimated: p.estimatedHours,
    actual: p.actualHours,
  }));

  const upcomingMilestones = projects.flatMap(p => p.milestones.filter(m => m.status !== 'completed')).slice(0, 5);

  const statCards = [
    { label: 'Present', value: presentCount, total: allEmployees.filter(e => e.status === 'active').length, icon: Users, color: 'bg-gradient-to-br from-emerald-400 to-green-600', change: '+2', trend: 'up' as const },
    { label: 'Active Projects', value: activeProjects, icon: FolderKanban, color: 'bg-gradient-to-br from-teal-400 to-emerald-600' },
    { label: 'Completed Tasks', value: completedTasks, icon: CheckSquare, color: 'bg-gradient-to-br from-green-400 to-emerald-600', change: '+5', trend: 'up' as const },
    { label: 'Overdue Tasks', value: overdueTasks, icon: AlertTriangle, color: 'bg-gradient-to-br from-red-400 to-red-600', change: overdueTasks > 0 ? `+${overdueTasks}` : '0', trend: overdueTasks > 0 ? 'down' as const : 'up' as const },
    { label: 'Absent', value: absentCount, icon: Clock, color: 'bg-gradient-to-br from-amber-400 to-amber-600' },
    { label: 'Pending Leave', value: pendingLeave, icon: FileWarning, color: 'bg-gradient-to-br from-purple-400 to-purple-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            {dateFilter === 'today' && "Today's overview"}
            {dateFilter === 'this_week' && 'This week overview'}
            {dateFilter === 'this_month' && 'This month overview'}
            {dateFilter === 'last_month' && 'Last month overview'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {dateFilters.map(f => (
            <button key={f.value} onClick={() => setDateFilter(f.value)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${dateFilter === f.value ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {statCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="card p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${card.color} flex items-center justify-center shadow-sm`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                {card.change && (
                  <span className={`flex items-center text-xs font-medium ${card.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                    {card.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                    {card.change}
                  </span>
                )}
              </div>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
              <p className="text-xs text-gray-500 mt-1">{card.label}</p>
              {card.total && <p className="text-xs text-gray-400">of {card.total} total</p>}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Weekly Task Completion
          </h3>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={weeklyCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Area type="monotone" dataKey="completed" stroke="#10b981" fill="#10b98130" name="Completed" strokeWidth={2} />
              <Area type="monotone" dataKey="planned" stroke="#14b8a6" fill="#14b8a620" name="Planned" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Task Status Distribution</h3>
          {taskStatusData.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No tasks in selected period</p>
          ) : (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={200}>
                <PieChart>
                  <Pie data={taskStatusData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                    {taskStatusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {taskStatusData.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900 ml-auto">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Project Progress & Upcoming */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="card p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Estimated vs Actual Hours by Project</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={projectProgress}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="estimated" fill="#d1fae5" name="Estimated" radius={[4,4,0,0]} />
              <Bar dataKey="actual" fill="#10b981" name="Actual" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Upcoming Milestones
          </h3>
          <div className="space-y-3">
            {upcomingMilestones.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No upcoming milestones</p>
            ) : upcomingMilestones.map(ms => (
              <div key={ms.id} className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm font-medium text-gray-900">{ms.title}</p>
                <p className="text-xs text-gray-500 mt-1">Due: {ms.dueDate}</p>
                <span className={`badge mt-1 ${ms.status === 'in_progress' ? 'bg-blue-100 text-blue-700' : ms.status === 'overdue' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                  {ms.status.replace('_', ' ')}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Active Projects</h3>
          <div className="space-y-3">
            {projects.filter(p => p.status === 'active').map(p => (
              <Link key={p.id} to={`/projects/${p.id}`} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.title}</p>
                  <p className="text-xs text-gray-500">{p.members.length} members • Due {p.targetDeliveryDate}</p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${calculateProgress(p.id) >= 75 ? 'bg-green-500' : calculateProgress(p.id) >= 50 ? 'bg-blue-500' : 'bg-amber-500'}`} style={{ width: `${calculateProgress(p.id)}%` }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{calculateProgress(p.id)}%</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-4">Pending Leave Requests</h3>
          <div className="space-y-3">
            {leaveRequests.filter(l => l.status === 'pending').length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">No pending requests</p>
            ) : leaveRequests.filter(l => l.status === 'pending').map(l => {
              const emp = allEmployees.find(e => e.id === l.employeeId);
              return (
                <div key={l.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                      {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                      <p className="text-xs text-gray-500">{l.startDate} to {l.endDate} • {l.reason}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Approve</button>
                    <button className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reject</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Upcoming Birthdays & Work Anniversaries - Persistent Counter */}
      {(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const upcomingEvents: { type: 'birthday' | 'anniversary'; employee: typeof allEmployees[0]; date: Date; daysUntil: number; age?: number; yearsAtCompany?: number }[] = [];
        
        allEmployees.filter(e => e.status === 'active').forEach(emp => {
          // Birthday check
          if (emp.dateOfBirth) {
            const dob = new Date(emp.dateOfBirth);
            const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
            if (thisYearBday < today) thisYearBday.setFullYear(today.getFullYear() + 1);
            const daysUntil = Math.ceil((thisYearBday.getTime() - today.getTime()) / 86400000);
            if (daysUntil <= 2 && daysUntil >= 0) {
              const age = thisYearBday.getFullYear() - dob.getFullYear();
              upcomingEvents.push({ type: 'birthday', employee: emp, date: thisYearBday, daysUntil, age });
            }
          }
          // Work anniversary check
          const joinDate = new Date(emp.joiningDate);
          if (today.getFullYear() > joinDate.getFullYear()) {
            const thisYearAnn = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
            if (thisYearAnn < today) thisYearAnn.setFullYear(today.getFullYear() + 1);
            const daysUntil = Math.ceil((thisYearAnn.getTime() - today.getTime()) / 86400000);
            if (daysUntil <= 2 && daysUntil >= 0) {
              const years = thisYearAnn.getFullYear() - joinDate.getFullYear();
              upcomingEvents.push({ type: 'anniversary', employee: emp, date: thisYearAnn, daysUntil, yearsAtCompany: years });
            }
          }
        });

        if (upcomingEvents.length === 0) return null;

        return (
          <div className="card p-6 border-l-4 border-l-pink-500 bg-gradient-to-r from-pink-50 to-purple-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                🎉 Upcoming Celebrations
              </h3>
              <span className="badge bg-pink-100 text-pink-700">{upcomingEvents.length} event{upcomingEvents.length > 1 ? 's' : ''} in next 2 days</span>
            </div>
            <div className="space-y-2">
              {upcomingEvents.map((evt, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-white rounded-lg border border-pink-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                      {evt.employee.firstName[0]}{evt.employee.lastName[0]}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{evt.employee.firstName} {evt.employee.lastName}</p>
                      <p className="text-xs text-gray-500">
                        {evt.type === 'birthday' ? `🎂 Birthday turning ${evt.age}` : `🎉 Work Anniversary (${evt.yearsAtCompany} year${evt.yearsAtCompany! > 1 ? 's' : ''})`}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-pink-700">
                      {evt.daysUntil === 0 ? 'Today!' : evt.daysUntil === 1 ? 'Tomorrow' : `In ${evt.daysUntil} days`}
                    </p>
                    <p className="text-xs text-gray-500">{evt.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Attendance Overview */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">
          {dateFilter === 'today' ? "Today's" : dateFilter === 'this_week' ? "This Week's" : dateFilter === 'this_month' ? "This Month's" : "Last Month's"} Attendance Overview
        </h3>
        {filteredAttendance.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">No attendance records for selected period</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Employee</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Date</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Check In</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Check Out</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.slice(0, 10).map(a => {
                  const emp = allEmployees.find(e => e.id === a.employeeId);
                  return (
                    <tr key={a.id} className="border-b border-gray-50 hover:bg-gray-50">
                      <td className="py-2 px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                            {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                          </div>
                          <span className="font-medium">{emp?.firstName} {emp?.lastName}</span>
                        </div>
                      </td>
                      <td className="py-2 px-3 text-gray-600 text-xs">{a.workDate}</td>
                      <td className="py-2 px-3 text-gray-600">{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="py-2 px-3 text-gray-600">{a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      <td className="py-2 px-3">
                        <span className={`badge ${a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'late' ? 'bg-amber-100 text-amber-700' : a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
