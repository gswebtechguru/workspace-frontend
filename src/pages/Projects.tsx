import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../contexts/DataContext';
import { Search, Plus, Users, Calendar, MessageSquare } from 'lucide-react';
import { Project, ProjectStatus } from '../types';

const statusColors: Record<ProjectStatus, string> = {
  planning: 'bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-slate-300',
  active: 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300',
  on_hold: 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300',
  completed: 'bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300',
  cancelled: 'bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300',
  archived: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
};

const priorityColors: Record<string, string> = {
  low: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-slate-400',
  medium: 'bg-teal-100 dark:bg-teal-900/50 text-teal-600 dark:text-teal-300',
  high: 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-300',
  critical: 'bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-300',
};

export default function Projects() {
  const navigate = useNavigate();
  const { projects, tasks, projectMessages, employees: allEmployees } = useData();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const projectTasks = (projectId: string) => tasks.filter(t => t.projectId === projectId);

  const calculateProgress = (projectId: string) => {
    const pTasks = projectTasks(projectId);
    if (pTasks.length === 0) return 0;
    const completedTasks = pTasks.filter(t => t.status === 'completed').length;
    return Math.round((completedTasks / pTasks.length) * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
          <p className="text-sm text-gray-500">{filtered.length} projects</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 rounded-lg p-0.5">
            <button onClick={() => setViewMode('grid')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'grid' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Grid</button>
            <button onClick={() => setViewMode('list')} className={`px-3 py-1.5 text-xs font-medium rounded-md ${viewMode === 'list' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>List</button>
          </div>
          <button onClick={() => navigate('/projects/new')} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search projects..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="planning">Planning</option>
          <option value="active">Active</option>
          <option value="on_hold">On Hold</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Project Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => {
            const pTasks = projectTasks(p.id);
            const completedTasks = pTasks.filter(t => t.status === 'completed').length;
            return (
              <div
                key={p.id}
                onClick={() => navigate(`/projects/${p.id}`)}
                className="card p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-xs text-gray-400 font-mono">{p.projectId}</span>
                    <h3 className="font-semibold text-gray-900 mt-0.5">{p.title}</h3>
                  </div>
                  <div className="flex gap-1.5">
                    <span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span>
                    <span className={`badge ${priorityColors[p.priority]}`}>{p.priority}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-4">{p.description}</p>
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{calculateProgress(p.id)}%</span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${calculateProgress(p.id) >= 75 ? 'bg-gradient-to-r from-emerald-400 to-green-600' : calculateProgress(p.id) >= 50 ? 'bg-gradient-to-r from-teal-400 to-emerald-500' : 'bg-gradient-to-r from-amber-400 to-amber-500'}`}
                      style={{ width: `${calculateProgress(p.id)}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {p.members.length}</span>
                    <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {p.startDate}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5" /> {projectMessages.filter(m => m.projectId === p.id).length}</span>
                  </div>
                  <span>{completedTasks}/{pTasks.length} tasks</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Project</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Team</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Tasks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-500">Messages</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr
                  key={p.id}
                  onClick={() => navigate(`/projects/${p.id}`)}
                  className="border-t border-gray-100 hover:bg-gray-50 cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <p className="font-medium text-gray-900">{p.title}</p>
                    <p className="text-xs text-gray-400">{p.projectId}</p>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`badge ${statusColors[p.status]}`}>{p.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-3 px-4">{p.members.length} members</td>
                  <td className="py-3 px-4">{projectTasks(p.id).length} tasks</td>
                  <td className="py-3 px-4">{projectMessages.filter(m => m.projectId === p.id).length} msgs</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
