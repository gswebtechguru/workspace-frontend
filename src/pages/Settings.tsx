import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Clock, Calendar, Bell, Shield, Save, Plus, X } from 'lucide-react';
import { Announcement } from '../types';

export default function SettingsPage() {
  const { companySettings } = useData();
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: Building2 },
    { id: 'attendance', label: 'Attendance', icon: Clock },
    { id: 'reports', label: 'Reports', icon: Calendar },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500">Manage company settings and configurations</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-56 flex-shrink-0">
          <nav className="card p-2 space-y-1">
            {sections.map(s => {
              const Icon = s.icon;
              return (
                <button key={s.id} onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeSection === s.id ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <Icon className="w-4 h-4" /> {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1">
          {activeSection === 'general' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">General Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label><input className="input-field" defaultValue={companySettings.companyName} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Timezone</label>
                  <select className="input-field" defaultValue={companySettings.timezone}>
                    <option>Asia/Kolkata</option><option>UTC</option><option>America/New_York</option><option>Europe/London</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Working Days</label>
                  <div className="flex gap-2 flex-wrap">
                    {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((d, i) => (
                      <label key={i} className="flex items-center gap-1 text-xs bg-gray-50 px-2 py-1 rounded">
                        <input type="checkbox" defaultChecked={companySettings.workingDays.includes(i)} className="rounded" /> {d}
                      </label>
                    ))}
                  </div></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Default Work Hours</label><input className="input-field" type="number" defaultValue={8} /></div>
              </div>
              <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}

          {activeSection === 'attendance' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Settings</h3>
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800"><strong>Auto Check-in:</strong> Employees are automatically checked in on their first successful login of each scheduled workday. Duplicate check-ins are prevented.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Work Start Time</label><input className="input-field" type="time" defaultValue="09:00" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Work End Time</label><input className="input-field" type="time" defaultValue="18:00" /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Late Threshold (minutes)</label><input className="input-field" type="number" defaultValue={15} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Half Day Threshold (hours)</label><input className="input-field" type="number" defaultValue={4} /></div>
              </div>
              <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Report Settings</h3>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800"><strong>Daily Report Generation:</strong> Reports are automatically generated at the reporting cutoff time. Task statuses are captured as snapshots and preserved historically.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reporting Cutoff Time</label><input className="input-field" type="time" defaultValue={companySettings.reportingCutoffTime} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reminder Before Cutoff (minutes)</label><input className="input-field" type="number" defaultValue={30} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Min Time Entry (minutes)</label><input className="input-field" type="number" defaultValue={companySettings.minTimeEntryMinutes} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Max Time Entry (minutes)</label><input className="input-field" type="number" defaultValue={companySettings.maxTimeEntryMinutes} /></div>
              </div>
              <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Notification Settings</h3>
              <div className="space-y-4">
                {['Task assignments', 'Task completions', 'Mentions in chat', 'Project updates', 'Leave decisions', 'Deadline reminders', 'Report generation'].map(item => (
                  <div key={item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm text-gray-700">{item}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" defaultChecked className="sr-only peer" />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                ))}
              </div>
              <button className="btn-primary flex items-center gap-2"><Save className="w-4 h-4" /> Save Changes</button>
            </div>
          )}

          {activeSection === 'security' && (
            <div className="card p-6 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Security Settings</h3>
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Password Policy</h4>
                  <p className="text-xs text-gray-500 mt-1">Minimum 8 characters, at least one uppercase, one number, and one special character</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Session Timeout</h4>
                  <p className="text-xs text-gray-500 mt-1">Users are logged out after 8 hours of inactivity</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Rate Limiting</h4>
                  <p className="text-xs text-gray-500 mt-1">60 requests per minute per user, 10 login attempts per 15 minutes</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-900">Audit Logging</h4>
                  <p className="text-xs text-gray-500 mt-1">All sensitive operations are logged with actor, timestamp, and change details</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function Announcements() {
  const { announcements, addAnnouncement, employees } = useData();
  const { employee } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [newAnn, setNewAnn] = useState({ title: '', content: '', audience: 'all' as const, expiresAt: '' });

  const handleCreate = () => {
    if (!newAnn.title || !newAnn.content) return;
    const ann: Announcement = {
      id: `ann_${Date.now()}`,
      title: newAnn.title,
      content: newAnn.content,
      audience: newAnn.audience,
      publishedAt: new Date().toISOString(),
      expiresAt: newAnn.expiresAt || undefined,
      attachments: [],
      createdBy: employee?.id || 'e1',
    };
    addAnnouncement(ann);
    setShowCreate(false);
    setNewAnn({ title: '', content: '', audience: 'all', expiresAt: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-sm text-gray-500">Company-wide communications and notices</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" /> New Announcement</button>
      </div>

      {announcements.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No announcements yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map(ann => {
            const creator = employees.find(e => e.id === ann.createdBy);
            return (
              <div key={ann.id} className="card p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">{ann.title}</h3>
                    <p className="text-xs text-gray-500 mt-1">
                      By {creator?.firstName} {creator?.lastName} • {new Date(ann.publishedAt).toLocaleDateString()}
                      {ann.expiresAt && ` • Expires: ${new Date(ann.expiresAt).toLocaleDateString()}`}
                    </p>
                  </div>
                  <span className={`badge ${ann.audience === 'all' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'}`}>
                    {ann.audience === 'all' ? 'Everyone' : ann.audience}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-3">{ann.content}</p>
              </div>
            );
          })}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreate(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-lg font-semibold">New Announcement</h2>
              <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Title</label><input className="input-field" value={newAnn.title} onChange={e => setNewAnn({...newAnn, title: e.target.value})} placeholder="Announcement title" /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Content</label><textarea className="input-field" rows={4} value={newAnn.content} onChange={e => setNewAnn({...newAnn, content: e.target.value})} placeholder="Announcement content" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
                  <select className="input-field" value={newAnn.audience} onChange={e => setNewAnn({...newAnn, audience: e.target.value as any})}>
                    <option value="all">Everyone</option><option value="department">Department</option><option value="team">Team</option><option value="project">Project</option>
                  </select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Expires On</label><input className="input-field" type="date" value={newAnn.expiresAt} onChange={e => setNewAnn({...newAnn, expiresAt: e.target.value})} /></div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleCreate} disabled={!newAnn.title || !newAnn.content} className="btn-primary flex-1 disabled:opacity-50">Publish</button>
                <button onClick={() => setShowCreate(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
