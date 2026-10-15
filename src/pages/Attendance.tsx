import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { useAuth } from '../contexts/AuthContext';
import { Clock, UserCheck, XCircle, AlertCircle } from 'lucide-react';

export default function Attendance() {
  const { attendanceRecords, employees, leaveRequests, leaveTypes, addLeaveRequest, updateLeaveRequest } = useData();
  const { employee } = useAuth();
  const [activeTab, setActiveTab] = useState<'attendance' | 'leave'>('attendance');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ leaveTypeId: 'lt1', startDate: '', endDate: '', reason: '' });

  const todayRecords = attendanceRecords.filter(a => a.workDate === dateFilter);
  const presentCount = todayRecords.filter(a => a.status === 'present' || a.status === 'late').length;
  const absentCount = todayRecords.filter(a => a.status === 'absent').length;
  const lateCount = todayRecords.filter(a => a.isLate).length;

  const handleApproveLeave = (id: string) => {
    updateLeaveRequest(id, { status: 'approved', approverId: employee?.id, decisionAt: new Date().toISOString() });
  };

  const handleRejectLeave = (id: string) => {
    updateLeaveRequest(id, { status: 'rejected', approverId: employee?.id, decisionAt: new Date().toISOString() });
  };

  const handleSubmitLeave = () => {
    if (!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason) return;
    const req = {
      id: `l_${Date.now()}`,
      employeeId: employee?.id || 'e1',
      leaveTypeId: leaveForm.leaveTypeId,
      startDate: leaveForm.startDate,
      endDate: leaveForm.endDate,
      duration: 'full_day' as const,
      reason: leaveForm.reason,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    };
    addLeaveRequest(req);
    setShowLeaveModal(false);
    setLeaveForm({ leaveTypeId: 'lt1', startDate: '', endDate: '', reason: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Attendance & Leave</h1>
          <p className="text-sm text-gray-500">Track employee attendance and manage leave requests</p>
        </div>
        <input type="date" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="input-field w-auto" />
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        <button onClick={() => setActiveTab('attendance')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'attendance' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Attendance</button>
        <button onClick={() => setActiveTab('leave')} className={`px-4 py-2 text-sm font-medium rounded-md ${activeTab === 'leave' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}>Leave Requests</button>
      </div>

      {activeTab === 'attendance' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center"><UserCheck className="w-5 h-5 text-green-600" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{presentCount}</p><p className="text-xs text-gray-500">Present</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center"><XCircle className="w-5 h-5 text-red-600" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{absentCount}</p><p className="text-xs text-gray-500">Absent</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center"><AlertCircle className="w-5 h-5 text-amber-600" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{lateCount}</p><p className="text-xs text-gray-500">Late Arrivals</p></div>
              </div>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center"><Clock className="w-5 h-5 text-blue-600" /></div>
                <div><p className="text-2xl font-bold text-gray-900">{todayRecords.filter(a => a.isMissingCheckout).length}</p><p className="text-xs text-gray-500">Missing Checkout</p></div>
              </div>
            </div>
          </div>

          {/* Attendance Table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Attendance for {dateFilter}</h3>
              <p className="text-xs text-gray-500 mt-1">Auto check-in on first login • Source: automatic_login</p>
            </div>
            {todayRecords.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No attendance records for this date</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Employee</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Check In</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Check Out</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Total Hours</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-500">Source</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todayRecords.map(a => {
                      const emp = employees.find(e => e.id === a.employeeId);
                      const totalHours = a.checkInAt && a.checkOutAt ? ((new Date(a.checkOutAt).getTime() - new Date(a.checkInAt).getTime()) / 3600000).toFixed(1) : '—';
                      return (
                        <tr key={a.id} className="border-t border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">
                                {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                                <p className="text-xs text-gray-400">{emp?.employeeId}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4 text-gray-600">{a.checkInAt ? new Date(a.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                          <td className="py-3 px-4 text-gray-600">{a.checkOutAt ? new Date(a.checkOutAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : <span className="text-amber-600">Pending</span>}</td>
                          <td className="py-3 px-4 text-gray-600">{totalHours}h</td>
                          <td className="py-3 px-4">
                            <span className={`badge ${a.status === 'present' ? 'bg-green-100 text-green-700' : a.status === 'late' ? 'bg-amber-100 text-amber-700' : a.status === 'absent' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                              {a.status}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-xs text-gray-500">{a.source.replace(/_/g, ' ')}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <>
          {/* Leave Requests */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Leave Requests</h3>
              <button onClick={() => setShowLeaveModal(true)} className="btn-primary text-xs">New Request</button>
            </div>
            {leaveRequests.length === 0 ? (
              <p className="text-center py-12 text-gray-500">No leave requests</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {leaveRequests.map(l => {
                  const emp = employees.find(e => e.id === l.employeeId);
                  const lt = leaveTypes.find(t => t.id === l.leaveTypeId);
                  return (
                    <div key={l.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex items-center gap-3 flex-1">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                          {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{emp?.firstName} {emp?.lastName}</p>
                          <p className="text-sm text-gray-500">{lt?.name} • {l.startDate} to {l.endDate}</p>
                          <p className="text-xs text-gray-400 mt-0.5">{l.reason}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`badge ${l.status === 'approved' ? 'bg-green-100 text-green-700' : l.status === 'pending' ? 'bg-amber-100 text-amber-700' : l.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                          {l.status}
                        </span>
                        {l.status === 'pending' && (
                          <div className="flex gap-1">
                            <button onClick={() => handleApproveLeave(l.id)} className="px-3 py-1.5 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700">Approve</button>
                            <button onClick={() => handleRejectLeave(l.id)} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700">Reject</button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Leave Balance Summary */}
          <div className="card p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Leave Type Configuration</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {leaveTypes.map(lt => (
                <div key={lt.id} className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm font-medium text-gray-900">{lt.name}</p>
                  <p className="text-xs text-gray-500 mt-1">{lt.maxDaysPerYear ? `${lt.maxDaysPerYear} days/year` : 'Unlimited'}</p>
                  <span className={`badge mt-2 ${lt.isPaid ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{lt.isPaid ? 'Paid' : 'Unpaid'}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Leave Request Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowLeaveModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold">New Leave Request</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
                <select className="input-field" value={leaveForm.leaveTypeId} onChange={e => setLeaveForm({...leaveForm, leaveTypeId: e.target.value})}>
                  {leaveTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label><input className="input-field" type="date" value={leaveForm.startDate} onChange={e => setLeaveForm({...leaveForm, startDate: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">End Date</label><input className="input-field" type="date" value={leaveForm.endDate} onChange={e => setLeaveForm({...leaveForm, endDate: e.target.value})} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                <textarea className="input-field" rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({...leaveForm, reason: e.target.value})} placeholder="Reason for leave..." />
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmitLeave} disabled={!leaveForm.startDate || !leaveForm.endDate || !leaveForm.reason} className="btn-primary flex-1 disabled:opacity-50">Submit Request</button>
                <button onClick={() => setShowLeaveModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
