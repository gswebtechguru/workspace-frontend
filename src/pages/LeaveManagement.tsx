import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { Calendar, Clock, CheckCircle2, XCircle, AlertCircle, Plus, FileText, Filter } from 'lucide-react';
import { LeaveRequest, LeaveDuration, LeaveType } from '../types';

const durationLabels: Record<LeaveDuration, string> = {
  full_day: 'Full Day',
  first_half: 'First Half',
  second_half: 'Second Half',
  morning_short: 'Morning Short Leave',
  evening_short: 'Evening Short Leave',
};

const durationColors: Record<LeaveDuration, string> = {
  full_day: 'bg-blue-100 text-blue-700',
  first_half: 'bg-indigo-100 text-indigo-700',
  second_half: 'bg-purple-100 text-purple-700',
  morning_short: 'bg-amber-100 text-amber-700',
  evening_short: 'bg-orange-100 text-orange-700',
};

export default function LeaveManagement() {
  const { employee, isAdmin } = useAuth();
  const { leaveRequests, leaveTypes, employees: allEmployees, addLeaveRequest, updateLeaveRequest, addNotification } = useData();
  
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState<{action: 'approve' | 'reject', leaveId: string} | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [newLeave, setNewLeave] = useState({
    leaveTypeId: 'lt1',
    startDate: '',
    endDate: '',
    duration: 'full_day' as LeaveDuration,
    reason: '',
  });

  if (!employee) return null;

  // Get user-specific leave requests
  const userLeaveRequests = isAdmin 
    ? leaveRequests 
    : leaveRequests.filter(r => r.employeeId === employee.id);

  // Filter leave requests based on role and status
  const filteredRequests = userLeaveRequests.filter(r => 
    filterStatus === 'all' || r.status === filterStatus
  );

  // Calculate counters based on role
  const pendingCount = userLeaveRequests.filter(r => r.status === 'pending').length;
  const approvedCount = userLeaveRequests.filter(r => r.status === 'approved').length;
  const rejectedCount = userLeaveRequests.filter(r => r.status === 'rejected').length;

  const handleApplyLeave = () => {
    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!newLeave.startDate) errors.startDate = true;
    if (!newLeave.endDate) errors.endDate = true;
    if (!newLeave.reason.trim()) errors.reason = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const leaveRequest: LeaveRequest = {
      id: `l_${Date.now()}`,
      employeeId: employee.id,
      leaveTypeId: newLeave.leaveTypeId,
      startDate: newLeave.startDate,
      endDate: newLeave.endDate,
      duration: newLeave.duration,
      reason: newLeave.reason,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    addLeaveRequest(leaveRequest);

    // Notify admins
    allEmployees.filter(e => e.role === 'admin').forEach(admin => {
      addNotification({
        id: `notif_leave_${Date.now()}_${admin.id}`,
        userId: admin.userId,
        type: 'leave_approved',
        title: 'New Leave Request',
        message: `${employee.firstName} ${employee.lastName} applied for ${durationLabels[newLeave.duration]} leave from ${newLeave.startDate} to ${newLeave.endDate}`,
        entityId: leaveRequest.id,
        entityType: 'leave',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    });

    setShowApplyModal(false);
    setFormErrors({});
    setNewLeave({
      leaveTypeId: 'lt1',
      startDate: '',
      endDate: '',
      duration: 'full_day',
      reason: '',
    });
  };

  const handleApprove = (leaveId: string) => {
    const leave = leaveRequests.find(l => l.id === leaveId);
    if (!leave) return;

    updateLeaveRequest(leaveId, {
      status: 'approved',
      approverId: employee.id,
      decisionAt: new Date().toISOString(),
    });

    // Notify employee
    const emp = allEmployees.find(e => e.id === leave.employeeId);
    if (emp) {
      addNotification({
        id: `notif_leave_approved_${Date.now()}`,
        userId: emp.userId,
        type: 'leave_approved',
        title: 'Leave Approved',
        message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been approved`,
        entityId: leaveId,
        entityType: 'leave',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const handleReject = (leaveId: string) => {
    const leave = leaveRequests.find(l => l.id === leaveId);
    if (!leave) return;

    updateLeaveRequest(leaveId, {
      status: 'rejected',
      approverId: employee.id,
      decisionAt: new Date().toISOString(),
    });

    // Notify employee
    const emp = allEmployees.find(e => e.id === leave.employeeId);
    if (emp) {
      addNotification({
        id: `notif_leave_rejected_${Date.now()}`,
        userId: emp.userId,
        type: 'leave_rejected',
        title: 'Leave Rejected',
        message: `Your leave request from ${leave.startDate} to ${leave.endDate} has been rejected`,
        entityId: leaveId,
        entityType: 'leave',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }
  };

  const getLeaveTypeName = (leaveTypeId: string) => {
    const leaveType = leaveTypes.find(lt => lt.id === leaveTypeId);
    return leaveType?.name || 'Unknown';
  };

  const getEmployeeName = (employeeId: string) => {
    const emp = allEmployees.find(e => e.id === employeeId);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-sm text-gray-500">
            {isAdmin ? 'Manage employee leave requests' : 'Apply and track your leave requests'}
          </p>
        </div>
        {!isAdmin && (
          <button onClick={() => setShowApplyModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" /> Apply for Leave
          </button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Clock className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
              <p className="text-xs text-gray-500">Pending Requests</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{approvedCount}</p>
              <p className="text-xs text-gray-500">Approved</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{rejectedCount}</p>
              <p className="text-xs text-gray-500">Rejected</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'all' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All ({userLeaveRequests.length})
        </button>
        <button
          onClick={() => setFilterStatus('pending')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Pending ({pendingCount})
        </button>
        <button
          onClick={() => setFilterStatus('approved')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'approved' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Approved ({approvedCount})
        </button>
        <button
          onClick={() => setFilterStatus('rejected')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            filterStatus === 'rejected' ? 'bg-red-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Rejected ({rejectedCount})
        </button>
      </div>

      {/* Leave Requests List */}
      <div className="card overflow-hidden">
        {filteredRequests.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No leave requests found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredRequests.map(leave => {
              const leaveType = leaveTypes.find(lt => lt.id === leave.leaveTypeId);
              const emp = allEmployees.find(e => e.id === leave.employeeId);
              
              return (
                <div key={leave.id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {isAdmin && (
                          <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-700">
                            {emp?.firstName?.[0]}{emp?.lastName?.[0]}
                          </div>
                        )}
                        <div>
                          <p className="font-semibold text-gray-900">
                            {isAdmin ? getEmployeeName(leave.employeeId) : getLeaveTypeName(leave.leaveTypeId)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isAdmin ? getLeaveTypeName(leave.leaveTypeId) : `${leave.startDate} to ${leave.endDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`badge ${durationColors[leave.duration]}`}>
                          {durationLabels[leave.duration]}
                        </span>
                        <span className={`badge ${
                          leave.status === 'approved' ? 'bg-green-100 text-green-700' :
                          leave.status === 'rejected' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {leave.status}
                        </span>
                        {!isAdmin && (
                          <span className="text-xs text-gray-500">
                            {leave.startDate} to {leave.endDate}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{leave.reason}</p>
                      {leave.decisionNotes && (
                        <p className="text-xs text-gray-500 mt-1 italic">
                          Note: {leave.decisionNotes}
                        </p>
                      )}
                    </div>
                    {isAdmin && leave.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => setShowConfirmModal({ action: 'approve', leaveId: leave.id })}
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-4 h-4" /> Approve
                        </button>
                        <button
                          onClick={() => setShowConfirmModal({ action: 'reject', leaveId: leave.id })}
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-4 h-4" /> Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Apply Leave Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowApplyModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Apply for Leave</h2>
              <p className="text-sm text-gray-500 mt-1">Fill in the details to submit your leave request</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type *</label>
                <select
                  className="input-field"
                  value={newLeave.leaveTypeId}
                  onChange={e => setNewLeave({...newLeave, leaveTypeId: e.target.value})}
                >
                  {leaveTypes.map((lt: LeaveType) => (
                    <option key={lt.id} value={lt.id}>{lt.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
                  <input
                    type="date"
                    className={`input-field ${formErrors.startDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={newLeave.startDate}
                    onChange={e => {
                      setNewLeave({...newLeave, startDate: e.target.value});
                      if (formErrors.startDate) setFormErrors({...formErrors, startDate: false});
                    }}
                    min={new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.startDate && (
                    <p className="text-xs text-red-600 mt-1">Start date is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
                  <input
                    type="date"
                    className={`input-field ${formErrors.endDate ? 'border-red-500 focus:ring-red-500' : ''}`}
                    value={newLeave.endDate}
                    onChange={e => {
                      setNewLeave({...newLeave, endDate: e.target.value});
                      if (formErrors.endDate) setFormErrors({...formErrors, endDate: false});
                    }}
                    min={newLeave.startDate || new Date().toISOString().split('T')[0]}
                  />
                  {formErrors.endDate && (
                    <p className="text-xs text-red-600 mt-1">End date is required</p>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duration *</label>
                <select
                  className="input-field"
                  value={newLeave.duration}
                  onChange={e => setNewLeave({...newLeave, duration: e.target.value as LeaveDuration})}
                >
                  <option value="full_day">Full Day</option>
                  <option value="first_half">First Half</option>
                  <option value="second_half">Second Half</option>
                  <option value="morning_short">Morning Short Leave</option>
                  <option value="evening_short">Evening Short Leave</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {newLeave.duration === 'full_day' && 'Full working day leave'}
                  {newLeave.duration === 'first_half' && 'Leave for the first half of the day (morning)'}
                  {newLeave.duration === 'second_half' && 'Leave for the second half of the day (afternoon)'}
                  {newLeave.duration === 'morning_short' && 'Short leave in the morning (1-2 hours)'}
                  {newLeave.duration === 'evening_short' && 'Short leave in the evening (1-2 hours)'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reason *</label>
                <textarea
                  className={`input-field ${formErrors.reason ? 'border-red-500 focus:ring-red-500' : ''}`}
                  rows={3}
                  value={newLeave.reason}
                  onChange={e => {
                    setNewLeave({...newLeave, reason: e.target.value});
                    if (formErrors.reason) setFormErrors({...formErrors, reason: false});
                  }}
                  placeholder="Please provide a reason for your leave..."
                />
                {formErrors.reason && (
                  <p className="text-xs text-red-600 mt-1">Reason is required</p>
                )}
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleApplyLeave} className="btn-primary flex-1">
                  Submit Request
                </button>
                <button onClick={() => {
                  setShowApplyModal(false);
                  setFormErrors({});
                }} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowConfirmModal(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                  showConfirmModal.action === 'approve' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  {showConfirmModal.action === 'approve' ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                  ) : (
                    <XCircle className="w-6 h-6 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {showConfirmModal.action === 'approve' ? 'Approve Leave Request' : 'Reject Leave Request'}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {showConfirmModal.action === 'approve' 
                      ? 'Are you sure you want to approve this leave request?'
                      : 'Are you sure you want to reject this leave request?'}
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (showConfirmModal.action === 'approve') {
                      handleApprove(showConfirmModal.leaveId);
                    } else {
                      handleReject(showConfirmModal.leaveId);
                    }
                    setShowConfirmModal(null);
                  }}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    showConfirmModal.action === 'approve'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {showConfirmModal.action === 'approve' ? 'Approve' : 'Reject'}
                </button>
                <button
                  onClick={() => setShowConfirmModal(null)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
