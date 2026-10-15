import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { Search, Plus, Mail, Calendar, X, Edit2, UserCheck, UserX } from 'lucide-react';
import { Employee } from '../types';

export default function Employees() {
  const { employees, departments, addEmployee, updateEmployee, toggleEmployeeStatus } = useData();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [confirmAction, setConfirmAction] = useState<{ empId: string; action: 'activate' | 'deactivate' } | null>(null);
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});
  const [newEmp, setNewEmp] = useState({
    firstName: '', lastName: '', username: '', password: '', email: '', phone: '',
    dateOfBirth: '', joiningDate: '', department: 'Engineering', designation: '',
    gender: 'male' as 'male' | 'female' | 'other'
  });

  const filtered = employees.filter(e => {
    const matchSearch = !search || `${e.firstName} ${e.lastName} ${e.username} ${e.email || ''} ${e.employeeId}`.toLowerCase().includes(search.toLowerCase());
    const matchDept = !deptFilter || e.department === deptFilter;
    const matchStatus = !statusFilter || e.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleCreate = () => {
    // Validate required fields
    const errors: Record<string, boolean> = {};
    if (!newEmp.firstName.trim()) errors.firstName = true;
    if (!newEmp.lastName.trim()) errors.lastName = true;
    if (!newEmp.username.trim()) errors.username = true;
    if (!newEmp.password.trim()) errors.password = true;
    if (!newEmp.joiningDate) errors.joiningDate = true;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    const emp: Employee = {
      id: `e_${Date.now()}`,
      userId: `u_${Date.now()}`,
      employeeId: `EMP${String(employees.length + 1).padStart(3, '0')}`,
      firstName: newEmp.firstName,
      lastName: newEmp.lastName,
      username: newEmp.username,
      password: newEmp.password,
      email: newEmp.email || undefined,
      phone: newEmp.phone || undefined,
      gender: newEmp.gender,
      dateOfBirth: newEmp.dateOfBirth || undefined,
      joiningDate: newEmp.joiningDate,
      designation: newEmp.designation || 'Employee',
      department: newEmp.department,
      role: 'employee', // Always employee role
      status: 'active',
      workSchedule: { id: 'ws1', name: 'Standard', workDays: [1,2,3,4,5], startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata' },
      expectedWorkingHours: 8,
    };
    addEmployee(emp);
    setShowCreateModal(false);
    setNewEmp({
      firstName: '', lastName: '', username: '', password: '', email: '', phone: '',
      dateOfBirth: '', joiningDate: '', department: 'Engineering', designation: '',
      gender: 'male'
    });
  };

  const handleSaveEdit = () => {
    if (!editingEmployee) return;
    updateEmployee(editingEmployee.id, editingEmployee);
    setEditingEmployee(null);
    setSelectedEmployee(null);
  };

  const handleToggleStatus = (empId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'deactivate' : 'activate';
    setConfirmAction({ empId, action });
  };

  const confirmToggleStatus = () => {
    if (!confirmAction) return;
    toggleEmployeeStatus(confirmAction.empId);
    if (selectedEmployee?.id === confirmAction.empId) {
      setSelectedEmployee(prev => prev ? { ...prev, status: prev.status === 'active' ? 'inactive' : 'active' } : null);
    }
    setConfirmAction(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-sm text-gray-500">{filtered.length} of {employees.length} employees</p>
        </div>
        <button onClick={() => setShowCreateModal(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search by name, username, email, or ID..." value={search} onChange={e => setSearch(e.target.value)}
            className="input-field pl-10" />
        </div>
        <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Departments</option>
          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field w-auto">
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on_leave">On Leave</option>
        </select>
      </div>

      {/* Employee Grid */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-gray-500">No employees found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(emp => (
            <div key={emp.id} className="card p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {emp.firstName[0]}{emp.lastName[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 truncate">{emp.firstName} {emp.lastName}</h3>
                  <p className="text-sm text-gray-500 truncate">{emp.designation}</p>
                  <span className={`badge mt-1 ${emp.status === 'active' ? 'bg-green-100 text-green-700' : emp.status === 'on_leave' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600'}`}>
                    {emp.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
              <div className="space-y-1.5 text-sm text-gray-500 mb-4">
                <p className="flex items-center gap-2"><span className="font-medium text-gray-700">Username:</span> @{emp.username}</p>
                {emp.email && <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5" /> {emp.email}</p>}
                <p className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Joined {emp.joiningDate}</p>
              </div>
              {emp.skills && emp.skills.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {emp.skills.slice(0, 3).map(s => (
                    <span key={s} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-xs rounded-md">{s}</span>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button onClick={() => setSelectedEmployee(emp)} className="btn-secondary flex-1 text-xs flex items-center justify-center gap-1">
                  <Edit2 className="w-3 h-3" /> View / Edit
                </button>
                <button
                  onClick={() => handleToggleStatus(emp.id, emp.status)}
                  className={`flex-1 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${
                    emp.status === 'active'
                      ? 'bg-red-50 text-red-700 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 hover:bg-green-100'
                  }`}>
                  {emp.status === 'active' ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Employee View/Edit Modal */}
      {selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => { setSelectedEmployee(null); setEditingEmployee(null); }}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">{editingEmployee ? 'Edit Employee' : 'Employee Profile'}</h2>
              <button onClick={() => { setSelectedEmployee(null); setEditingEmployee(null); }} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              {!editingEmployee ? (
                <>
                  {/* View Mode */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                      {selectedEmployee.firstName[0]}{selectedEmployee.lastName[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{selectedEmployee.firstName} {selectedEmployee.lastName}</h3>
                      <p className="text-gray-500">{selectedEmployee.designation}</p>
                      <p className="text-sm text-gray-400">{selectedEmployee.employeeId} • @{selectedEmployee.username}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div><span className="text-gray-500">Username:</span> <span className="font-medium">@{selectedEmployee.username}</span></div>
                    <div><span className="text-gray-500">Email:</span> <span className="font-medium">{selectedEmployee.email || '—'}</span></div>
                    <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{selectedEmployee.phone || '—'}</span></div>
                    <div><span className="text-gray-500">Gender:</span> <span className="font-medium">{selectedEmployee.gender || '—'}</span></div>
                    <div><span className="text-gray-500">Date of Birth:</span> <span className="font-medium">{selectedEmployee.dateOfBirth || '—'}</span></div>
                    <div><span className="text-gray-500">Joining Date:</span> <span className="font-medium">{selectedEmployee.joiningDate}</span></div>
                    <div><span className="text-gray-500">Department:</span> <span className="font-medium">{selectedEmployee.department}</span></div>
                    <div><span className="text-gray-500">Team:</span> <span className="font-medium">{selectedEmployee.team || '—'}</span></div>
                    <div><span className="text-gray-500">Status:</span> <span className={`badge ${selectedEmployee.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{selectedEmployee.status}</span></div>
                  </div>
                  {selectedEmployee.skills && selectedEmployee.skills.length > 0 && (
                    <div className="mb-6">
                      <p className="text-sm text-gray-500 mb-2">Skills</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedEmployee.skills.map(s => <span key={s} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-sm rounded-lg">{s}</span>)}
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button onClick={() => setEditingEmployee({...selectedEmployee})} className="btn-primary flex-1 flex items-center justify-center gap-2">
                      <Edit2 className="w-4 h-4" /> Edit Details
                    </button>
                    <button
                      onClick={() => handleToggleStatus(selectedEmployee.id, selectedEmployee.status)}
                      className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                        selectedEmployee.status === 'active'
                          ? 'bg-red-600 text-white hover:bg-red-700'
                          : 'bg-green-600 text-white hover:bg-green-700'
                      }`}>
                      {selectedEmployee.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Edit Mode */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                        <input className="input-field" value={editingEmployee.firstName} onChange={e => setEditingEmployee({...editingEmployee, firstName: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                        <input className="input-field" value={editingEmployee.lastName} onChange={e => setEditingEmployee({...editingEmployee, lastName: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input className="input-field" value={editingEmployee.username} onChange={e => setEditingEmployee({...editingEmployee, username: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                        <input className="input-field bg-gray-50" value={editingEmployee.employeeId} disabled />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                      <input type="password" className="input-field" value={editingEmployee.password || ''} onChange={e => setEditingEmployee({...editingEmployee, password: e.target.value || undefined})} placeholder="Enter new password" />
                      <p className="text-xs text-gray-500 mt-1">Leave blank to keep current password</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input type="email" className="input-field" value={editingEmployee.email || ''} onChange={e => setEditingEmployee({...editingEmployee, email: e.target.value || undefined})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                        <input className="input-field" value={editingEmployee.phone || ''} onChange={e => setEditingEmployee({...editingEmployee, phone: e.target.value || undefined})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                        <input type="date" className="input-field" value={editingEmployee.dateOfBirth || ''} onChange={e => setEditingEmployee({...editingEmployee, dateOfBirth: e.target.value || undefined})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select className="input-field" value={editingEmployee.gender || ''} onChange={e => setEditingEmployee({...editingEmployee, gender: e.target.value as any})}>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                        <input type="date" className="input-field" value={editingEmployee.joiningDate} onChange={e => setEditingEmployee({...editingEmployee, joiningDate: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                        <input className="input-field" value={editingEmployee.designation} onChange={e => setEditingEmployee({...editingEmployee, designation: e.target.value})} />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select className="input-field" value={editingEmployee.department} onChange={e => setEditingEmployee({...editingEmployee, department: e.target.value})}>
                          {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Team</label>
                        <input className="input-field" value={editingEmployee.team || ''} onChange={e => setEditingEmployee({...editingEmployee, team: e.target.value || undefined})} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma separated)</label>
                      <input className="input-field" defaultValue={editingEmployee.skills?.join(', ') || ''} onBlur={e => {
                        const skills = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                        setEditingEmployee({...editingEmployee, skills});
                      }} placeholder="React, TypeScript, Node.js" />
                    </div>
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleSaveEdit} className="btn-primary flex-1">Save Changes</button>
                      <button onClick={() => setEditingEmployee(null)} className="btn-secondary flex-1">Cancel</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowCreateModal(false)}>
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
              <h2 className="text-lg font-semibold">Add New Employee</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                  <input 
                    className={`input-field ${formErrors.firstName ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    value={newEmp.firstName} 
                    onChange={e => {
                      setNewEmp({...newEmp, firstName: e.target.value});
                      if (formErrors.firstName) setFormErrors({...formErrors, firstName: false});
                    }}
                    placeholder="John" 
                  />
                  {formErrors.firstName && (
                    <p className="text-xs text-red-600 mt-1">First name is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                  <input 
                    className={`input-field ${formErrors.lastName ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    value={newEmp.lastName} 
                    onChange={e => {
                      setNewEmp({...newEmp, lastName: e.target.value});
                      if (formErrors.lastName) setFormErrors({...formErrors, lastName: false});
                    }}
                    placeholder="Doe" 
                  />
                  {formErrors.lastName && (
                    <p className="text-xs text-red-600 mt-1">Last name is required</p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                  <input 
                    className={`input-field ${formErrors.username ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    value={newEmp.username} 
                    onChange={e => {
                      setNewEmp({...newEmp, username: e.target.value});
                      if (formErrors.username) setFormErrors({...formErrors, username: false});
                    }}
                    placeholder="john.doe" 
                  />
                  {formErrors.username && (
                    <p className="text-xs text-red-600 mt-1">Username is required</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Used for login</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                  <input 
                    type="password" 
                    className={`input-field ${formErrors.password ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    value={newEmp.password} 
                    onChange={e => {
                      setNewEmp({...newEmp, password: e.target.value});
                      if (formErrors.password) setFormErrors({...formErrors, password: false});
                    }}
                    placeholder="Enter password" 
                  />
                  {formErrors.password && (
                    <p className="text-xs text-red-600 mt-1">Password is required</p>
                  )}
                  <p className="text-xs text-gray-500 mt-1">Initial password for login</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                  <input type="email" className="input-field" value={newEmp.email} onChange={e => setNewEmp({...newEmp, email: e.target.value})} placeholder="john@company.com" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                  <input className="input-field" value={newEmp.phone} onChange={e => setNewEmp({...newEmp, phone: e.target.value})} placeholder="+91-XXXXXXXXXX" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  <input type="date" className="input-field" value={newEmp.dateOfBirth} onChange={e => setNewEmp({...newEmp, dateOfBirth: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                  <select className="input-field" value={newEmp.gender} onChange={e => setNewEmp({...newEmp, gender: e.target.value as any})}>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joining Date *</label>
                  <input 
                    type="date" 
                    className={`input-field ${formErrors.joiningDate ? 'border-red-500 focus:ring-red-500' : ''}`} 
                    value={newEmp.joiningDate} 
                    onChange={e => {
                      setNewEmp({...newEmp, joiningDate: e.target.value});
                      if (formErrors.joiningDate) setFormErrors({...formErrors, joiningDate: false});
                    }} 
                  />
                  {formErrors.joiningDate && (
                    <p className="text-xs text-red-600 mt-1">Joining date is required</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="input-field" value={newEmp.department} onChange={e => setNewEmp({...newEmp, department: e.target.value})}>
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Designation</label>
                <input className="input-field" value={newEmp.designation} onChange={e => setNewEmp({...newEmp, designation: e.target.value})} placeholder="Software Developer" />
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> System will automatically send notifications to admin 2 days before employee's birthday and work anniversary.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={handleCreate} className="btn-primary flex-1">Create Employee</button>
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1">Cancel</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setConfirmAction(null)}>
          <div className="bg-white rounded-2xl w-full max-w-md" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center ${confirmAction.action === 'deactivate' ? 'bg-red-100' : 'bg-green-100'}`}>
                  {confirmAction.action === 'deactivate' ? (
                    <UserX className="w-6 h-6 text-red-600" />
                  ) : (
                    <UserCheck className="w-6 h-6 text-green-600" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {confirmAction.action === 'deactivate' ? 'Deactivate Employee' : 'Activate Employee'}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Are you sure you want to {confirmAction.action} this employee?
                  </p>
                </div>
              </div>
              {confirmAction.action === 'deactivate' && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mb-4">
                  <p className="text-xs text-amber-800">
                    <strong>Note:</strong> Deactivated employees cannot log in or access the system. Their historical data will be preserved.
                  </p>
                </div>
              )}
              <div className="flex gap-3">
                <button
                  onClick={confirmToggleStatus}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                    confirmAction.action === 'deactivate'
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {confirmAction.action === 'deactivate' ? 'Deactivate' : 'Activate'}
                </button>
                <button onClick={() => setConfirmAction(null)} className="btn-secondary flex-1">
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
