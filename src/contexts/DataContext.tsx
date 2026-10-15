import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { Task, AttendanceRecord, ProjectMessage, Notification, LeaveRequest, LeaveType, Project, Employee, DailyWorkReport, Announcement, TimeEntry, Department, CompanySettings } from '../types';
import { tasks as initialTasks, attendanceRecords as initialAttendance, projectMessages as initialMessages, notifications as initialNotifications, leaveRequests as initialLeave, leaveTypes as initialLeaveTypes, projects as initialProjects, employees as initialEmployees, dailyReports as initialReports, announcements as initialAnnouncements, departments as initialDepartments, companySettings as initialCompanySettings } from '../data/mockData';

interface DataContextType {
  tasks: Task[];
  attendanceRecords: AttendanceRecord[];
  projectMessages: ProjectMessage[];
  notifications: Notification[];
  leaveRequests: LeaveRequest[];
  leaveTypes: LeaveType[];
  projects: Project[];
  employees: Employee[];
  dailyReports: DailyWorkReport[];
  announcements: Announcement[];
  departments: Department[];
  companySettings: CompanySettings;
  // Helper functions
  getEmployeeName: (id: string) => string;
  getProjectName: (id: string) => string;
  // Task operations
  addTask: (task: Task) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  completeTask: (id: string, notes?: string) => void;
  reopenTask: (id: string, reason: string) => void;
  addTimeEntry: (entry: TimeEntry) => void;
  // Attendance
  checkOut: (employeeId: string) => void;
  // Messages
  addMessage: (msg: ProjectMessage) => void;
  deleteMessage: (id: string) => void;
  // Notifications
  markNotificationRead: (id: string) => void;
  addNotification: (n: Notification) => void;
  // Leave
  addLeaveRequest: (req: LeaveRequest) => void;
  updateLeaveRequest: (id: string, updates: Partial<LeaveRequest>) => void;
  // Projects
  updateProject: (id: string, updates: Partial<Project>) => void;
  addProject: (project: Project) => void;
  deleteProject: (id: string) => void;
  addProjectMember: (projectId: string, employeeId: string, role: string) => void;
  removeProjectMember: (projectId: string, memberId: string) => void;
  // Employees
  addEmployee: (emp: Employee) => void;
  updateEmployee: (id: string, updates: Partial<Employee>) => void;
  toggleEmployeeStatus: (id: string) => void;
  // Announcements
  addAnnouncement: (ann: Announcement) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>(initialAttendance);
  const [projectMessages, setProjectMessages] = useState<ProjectMessage[]>(initialMessages);
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    // Generate birthday and anniversary notifications
    const allNotifs = [...initialNotifications];
    const today = new Date();
    const in2Days = new Date(today.getTime() + 2 * 86400000);
    
    initialEmployees.forEach(emp => {
      if (emp.dateOfBirth) {
        const dob = new Date(emp.dateOfBirth);
        const thisYearBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
        const diffDays = Math.ceil((thisYearBday.getTime() - today.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays <= 2) {
          allNotifs.push({
            id: `notif_bday_${emp.id}`,
            userId: 'u7', // Admin user
            type: 'announcement',
            title: '🎂 Upcoming Birthday',
            message: `${emp.firstName} ${emp.lastName}'s birthday is in ${diffDays} day${diffDays !== 1 ? 's' : ''} (${emp.dateOfBirth})`,
            entityId: emp.id,
            entityType: 'employee',
            isRead: false,
            createdAt: new Date().toISOString(),
          });
        }
      }
      // Joining anniversary
      const joinDate = new Date(emp.joiningDate);
      const thisYearAnniversary = new Date(today.getFullYear(), joinDate.getMonth(), joinDate.getDate());
      const annDiffDays = Math.ceil((thisYearAnniversary.getTime() - today.getTime()) / 86400000);
      if (annDiffDays >= 0 && annDiffDays <= 2 && today.getFullYear() > joinDate.getFullYear()) {
        allNotifs.push({
          id: `notif_ann_${emp.id}`,
          userId: 'u7', // Admin user
          type: 'announcement',
          title: '🎉 Work Anniversary Approaching',
          message: `${emp.firstName} ${emp.lastName}'s work anniversary is in ${annDiffDays} day${annDiffDays !== 1 ? 's' : ''}`,
          entityId: emp.id,
          entityType: 'employee',
          isRead: false,
          createdAt: new Date().toISOString(),
        });
      }
    });
    
    return allNotifs;
  });
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(initialLeave);
  const [leaveTypes] = useState<LeaveType[]>(initialLeaveTypes);
  const [departments] = useState<Department[]>(initialDepartments);
  const [companySettings] = useState<CompanySettings>(initialCompanySettings);
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [employees, setEmployees] = useState<Employee[]>(initialEmployees);
  const [dailyReports, setDailyReports] = useState<DailyWorkReport[]>(initialReports);
  const [announcements, setAnnouncements] = useState<Announcement[]>(initialAnnouncements);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [task, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t));
  }, []);

  const completeTask = useCallback((id: string, notes?: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newHistory = [...t.statusHistory, {
        id: `sh_${Date.now()}`,
        fromStatus: t.status,
        toStatus: 'completed' as const,
        changedBy: 'current_user',
        changedAt: now,
      }];
      return { ...t, status: 'completed' as const, completedAt: now, completionNotes: notes, statusHistory: newHistory };
    }));
  }, []);

  const reopenTask = useCallback((id: string, reason: string) => {
    const now = new Date().toISOString();
    setTasks(prev => prev.map(t => {
      if (t.id !== id) return t;
      const newHistory = [...t.statusHistory, {
        id: `sh_${Date.now()}`,
        fromStatus: t.status,
        toStatus: 'in_progress' as const,
        changedBy: 'current_user',
        changedAt: now,
        reason,
      }];
      return { ...t, status: 'in_progress' as const, completedAt: undefined, statusHistory: newHistory };
    }));
  }, []);

  const addTimeEntry = useCallback((entry: TimeEntry) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== entry.taskId) return t;
      const newActual = t.actualMinutes + entry.durationMinutes;
      return { ...t, timeEntries: [...t.timeEntries, entry], actualMinutes: newActual };
    }));
  }, []);

  const checkOut = useCallback((employeeId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toISOString();
    setAttendanceRecords(prev => prev.map(a => {
      if (a.employeeId === employeeId && a.workDate === today) {
        return { ...a, checkOutAt: now, isMissingCheckout: false };
      }
      return a;
    }));
  }, []);

  const addMessage = useCallback((msg: ProjectMessage) => {
    setProjectMessages(prev => [...prev, msg]);
  }, []);

  const deleteMessage = useCallback((id: string) => {
    setProjectMessages(prev => prev.map(m => m.id === id ? { ...m, isDeleted: true } : m));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const addNotification = useCallback((n: Notification) => {
    setNotifications(prev => [n, ...prev]);
  }, []);

  const addLeaveRequest = useCallback((req: LeaveRequest) => {
    setLeaveRequests(prev => [req, ...prev]);
  }, []);

  const updateLeaveRequest = useCallback((id: string, updates: Partial<LeaveRequest>) => {
    setLeaveRequests(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const updateProject = useCallback((id: string, updates: Partial<Project>) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const addEmployee = useCallback((emp: Employee) => {
    setEmployees(prev => [emp, ...prev]);
  }, []);

  const updateEmployee = useCallback((id: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  }, []);

  const toggleEmployeeStatus = useCallback((id: string) => {
    setEmployees(prev => prev.map(e => {
      if (e.id === id) {
        const newStatus = e.status === 'active' ? 'inactive' : 'active';
        return { ...e, status: newStatus };
      }
      return e;
    }));
  }, []);

  const addProject = useCallback((project: Project) => {
    setProjects(prev => [project, ...prev]);
  }, []);

  const deleteProject = useCallback((id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
    // Also delete related tasks and messages
    setTasks(prev => prev.filter(t => t.projectId !== id));
    setProjectMessages(prev => prev.filter(m => m.projectId !== id));
  }, []);

  const addProjectMember = useCallback((projectId: string, employeeId: string, role: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        const newMember = {
          id: `pm_${Date.now()}`,
          employeeId,
          role: role as any,
          joinedAt: new Date().toISOString().split('T')[0]
        };
        return { ...p, members: [...p.members, newMember] };
      }
      return p;
    }));
  }, []);

  const removeProjectMember = useCallback((projectId: string, memberId: string) => {
    setProjects(prev => prev.map(p => {
      if (p.id === projectId) {
        return { ...p, members: p.members.filter(m => m.id !== memberId) };
      }
      return p;
    }));
  }, []);

  const addAnnouncement = useCallback((ann: Announcement) => {
    setAnnouncements(prev => [ann, ...prev]);
  }, []);

  // Helper functions
  const getEmployeeName = useCallback((id: string): string => {
    const emp = employees.find(e => e.id === id);
    return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
  }, [employees]);

  const getProjectName = useCallback((id: string): string => {
    const proj = projects.find(p => p.id === id);
    return proj ? proj.title : 'Unknown Project';
  }, [projects]);

  return (
    <DataContext.Provider value={{
      tasks, attendanceRecords, projectMessages, notifications, leaveRequests, leaveTypes, projects, employees, dailyReports, announcements, departments, companySettings,
      getEmployeeName, getProjectName,
      addTask, updateTask, completeTask, reopenTask, addTimeEntry,
      checkOut, addMessage, deleteMessage, markNotificationRead, addNotification,
      addLeaveRequest, updateLeaveRequest, updateProject, addProject, deleteProject, addProjectMember, removeProjectMember,
      addEmployee, updateEmployee, toggleEmployeeStatus, addAnnouncement,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
