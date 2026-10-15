import { Employee, Project, Task, AttendanceRecord, Notification, DailyWorkReport, ProjectMessage, Announcement, Department, Team, LeaveRequest, LeaveType, CompanySettings, DashboardMetrics, Milestone, WorkSchedule } from '../types';

const defaultSchedule: WorkSchedule = { id: 'ws1', name: 'Standard', workDays: [1,2,3,4,5], startTime: '09:00', endTime: '18:00', timezone: 'Asia/Kolkata' };

export const departments: Department[] = [
  { id: 'd1', name: 'Engineering', description: 'Software development', headId: 'e1' },
  { id: 'd2', name: 'Design', description: 'UI/UX design team', headId: 'e3' },
  { id: 'd3', name: 'QA', description: 'Quality assurance', headId: 'e5' },
  { id: 'd4', name: 'Product', description: 'Product management', headId: 'e7' },
];

export const teams: Team[] = [
  { id: 't1', name: 'Frontend Team', departmentId: 'd1', leadId: 'e1', members: ['e1','e2','e3'] },
  { id: 't2', name: 'Backend Team', departmentId: 'd1', leadId: 'e4', members: ['e4','e5','e6'] },
  { id: 't3', name: 'Mobile Team', departmentId: 'd1', leadId: 'e6', members: ['e6','e8'] },
];

export const employees: Employee[] = [
  { id: 'e1', userId: 'u1', employeeId: 'EMP001', firstName: 'Rajesh', lastName: 'Kumar', username: 'rajesh.kumar', password: 'Rajesh@123', email: 'rajesh@company.com', phone: '+91-9876543210', gender: 'male', dateOfBirth: '1990-05-15', joiningDate: '2022-01-15', designation: 'Senior Frontend Developer', department: 'Engineering', team: 'Frontend Team', reportingManager: 'e7', role: 'admin', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['React', 'TypeScript', 'Node.js'] },
  { id: 'e2', userId: 'u2', employeeId: 'EMP002', firstName: 'Priya', lastName: 'Sharma', username: 'priya.sharma', password: 'Priya@123', email: 'priya@company.com', phone: '+91-9876543211', gender: 'female', dateOfBirth: '1992-08-22', joiningDate: '2022-03-20', designation: 'UI/UX Designer', department: 'Design', team: 'Frontend Team', reportingManager: 'e1', role: 'employee', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['Figma', 'Adobe XD', 'CSS'] },
  { id: 'e3', userId: 'u3', employeeId: 'EMP003', firstName: 'Amit', lastName: 'Patel', username: 'amit.patel', password: 'Amit@123', email: 'amit@company.com', phone: '+91-9876543212', gender: 'male', dateOfBirth: '1988-12-10', joiningDate: '2022-06-10', designation: 'Backend Developer', department: 'Engineering', team: 'Backend Team', reportingManager: 'e1', role: 'employee', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['Laravel', 'MySQL', 'Redis'] },
  { id: 'e4', userId: 'u4', employeeId: 'EMP004', firstName: 'Sneha', lastName: 'Reddy', username: 'sneha.reddy', password: 'Sneha@123', email: 'sneha@company.com', phone: '+91-9876543213', gender: 'female', dateOfBirth: '1994-03-18', joiningDate: '2023-01-05', designation: 'QA Engineer', department: 'QA', team: 'Backend Team', reportingManager: 'e5', role: 'employee', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['Selenium', 'Jest', 'Cypress'] },
  { id: 'e5', userId: 'u5', employeeId: 'EMP005', firstName: 'Vikram', lastName: 'Singh', username: 'vikram.singh', password: 'Vikram@123', email: 'vikram@company.com', phone: '+91-9876543214', gender: 'male', dateOfBirth: '1985-07-25', joiningDate: '2021-11-01', designation: 'Tech Lead', department: 'Engineering', team: 'Backend Team', reportingManager: 'e7', role: 'admin', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['Java', 'Python', 'AWS'] },
  { id: 'e6', userId: 'u6', employeeId: 'EMP006', firstName: 'Ananya', lastName: 'Gupta', username: 'ananya.gupta', password: 'Ananya@123', email: 'ananya@company.com', phone: '+91-9876543215', gender: 'female', dateOfBirth: '1995-11-30', joiningDate: '2023-04-15', designation: 'Mobile Developer', department: 'Engineering', team: 'Mobile Team', reportingManager: 'e5', role: 'employee', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['React Native', 'Flutter', 'Swift'] },
  { id: 'e7', userId: 'u7', employeeId: 'EMP007', firstName: 'Suresh', lastName: 'Nair', username: 'suresh.nair', password: 'Suresh@123', email: 'suresh@company.com', phone: '+91-9876543216', gender: 'male', dateOfBirth: '1980-09-12', joiningDate: '2020-08-20', designation: 'Engineering Manager', department: 'Engineering', reportingManager: undefined, role: 'admin', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['Management', 'Architecture'] },
  { id: 'e8', userId: 'u8', employeeId: 'EMP008', firstName: 'Deepa', lastName: 'Joshi', username: 'deepa.joshi', password: 'Deepa@123', email: 'deepa@company.com', phone: '+91-9876543217', gender: 'female', dateOfBirth: '1998-02-14', joiningDate: '2023-07-01', designation: 'Junior Developer', department: 'Engineering', team: 'Mobile Team', reportingManager: 'e1', role: 'employee', status: 'active', workSchedule: defaultSchedule, expectedWorkingHours: 8, skills: ['JavaScript', 'HTML', 'CSS'] },
];

export const projects: Project[] = [
  {
    id: 'p1', projectId: 'PRJ001', title: 'E-Commerce Platform Redesign', description: 'Complete redesign of the e-commerce platform with modern UI/UX', technologyStack: ['React', 'Laravel', 'MySQL', 'Redis'], projectManagerId: 'e1', startDate: '2024-01-15', targetDeliveryDate: '2024-06-30', priority: 'high', status: 'active', estimatedHours: 2400, actualHours: 1680, progress: 65, createdAt: '2024-01-10', updatedAt: '2024-03-15',
    members: [{ id: 'pm1', employeeId: 'e1', role: 'manager', joinedAt: '2024-01-15' }, { id: 'pm2', employeeId: 'e2', role: 'designer', joinedAt: '2024-01-15' }, { id: 'pm3', employeeId: 'e3', role: 'developer', joinedAt: '2024-01-20' }, { id: 'pm4', employeeId: 'e4', role: 'tester', joinedAt: '2024-02-01' }],
    milestones: [{ id: 'm1', title: 'Design Phase Complete', dueDate: '2024-02-28', completedAt: '2024-02-25', status: 'completed' }, { id: 'm2', title: 'Frontend MVP', dueDate: '2024-04-30', status: 'in_progress' }, { id: 'm3', title: 'Backend Integration', dueDate: '2024-05-31', status: 'pending' }, { id: 'm4', title: 'QA & Launch', dueDate: '2024-06-30', status: 'pending' }],
    clientReference: 'ACME Corp', budget: 500000, requirements: 'Modern responsive design, payment integration, inventory management',
    attachments: [{ id: 'att1', fileName: 'Project_Brief.pdf', fileSize: 245000, mimeType: 'application/pdf', uploadedAt: '2024-01-10', uploadedBy: 'e1' }],
  },
  {
    id: 'p2', projectId: 'PRJ002', title: 'Mobile Banking App', description: 'Native mobile banking application for iOS and Android', technologyStack: ['React Native', 'Node.js', 'PostgreSQL'], projectManagerId: 'e5', startDate: '2024-02-01', targetDeliveryDate: '2024-08-15', priority: 'critical', status: 'active', estimatedHours: 3200, actualHours: 1200, progress: 35, createdAt: '2024-01-25', updatedAt: '2024-03-15',
    members: [{ id: 'pm5', employeeId: 'e5', role: 'manager', joinedAt: '2024-02-01' }, { id: 'pm6', employeeId: 'e6', role: 'developer', joinedAt: '2024-02-01' }, { id: 'pm7', employeeId: 'e8', role: 'developer', joinedAt: '2024-02-15' }],
    milestones: [{ id: 'm5', title: 'Architecture Design', dueDate: '2024-03-15', completedAt: '2024-03-10', status: 'completed' }, { id: 'm6', title: 'Core Features', dueDate: '2024-05-30', status: 'in_progress' }, { id: 'm7', title: 'Security Audit', dueDate: '2024-07-15', status: 'pending' }],
    clientReference: 'SecureBank Ltd', budget: 800000, attachments: [],
  },
  {
    id: 'p3', projectId: 'PRJ003', title: 'Internal HR Portal', description: 'Employee self-service portal for HR operations', technologyStack: ['React', 'Laravel', 'MySQL'], projectManagerId: 'e1', startDate: '2024-03-01', targetDeliveryDate: '2024-05-15', priority: 'medium', status: 'active', estimatedHours: 800, actualHours: 520, progress: 78, createdAt: '2024-02-20', updatedAt: '2024-03-15',
    members: [{ id: 'pm8', employeeId: 'e1', role: 'manager', joinedAt: '2024-03-01' }, { id: 'pm9', employeeId: 'e3', role: 'developer', joinedAt: '2024-03-01' }, { id: 'pm10', employeeId: 'e2', role: 'designer', joinedAt: '2024-03-01' }],
    milestones: [{ id: 'm8', title: 'Leave Management Module', dueDate: '2024-03-31', completedAt: '2024-03-28', status: 'completed' }, { id: 'm9', title: 'Attendance Module', dueDate: '2024-04-30', status: 'in_progress' }],
    budget: 200000, attachments: [],
  },
  {
    id: 'p4', projectId: 'PRJ004', title: 'Analytics Dashboard', description: 'Real-time analytics and reporting dashboard', technologyStack: ['React', 'D3.js', 'Python'], projectManagerId: 'e5', startDate: '2024-01-01', targetDeliveryDate: '2024-03-31', priority: 'medium', status: 'on_hold', estimatedHours: 1200, actualHours: 600, progress: 45, createdAt: '2023-12-15', updatedAt: '2024-03-01',
    members: [{ id: 'pm11', employeeId: 'e5', role: 'manager', joinedAt: '2024-01-01' }, { id: 'pm12', employeeId: 'e3', role: 'developer', joinedAt: '2024-01-01' }],
    milestones: [{ id: 'm10', title: 'Data Pipeline', dueDate: '2024-02-15', completedAt: '2024-02-10', status: 'completed' }, { id: 'm11', title: 'Dashboard UI', dueDate: '2024-03-31', status: 'pending' }],
    budget: 300000, attachments: [],
  },
];

const today = new Date().toISOString().split('T')[0];
const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const twoDaysAgo = new Date(Date.now() - 172800000).toISOString().split('T')[0];

export const tasks: Task[] = [
  { id: 't1', taskId: 'TSK001', title: 'Implement user authentication flow', description: 'Build login, registration, and password reset', projectId: 'p1', milestoneId: 'm2', creatorId: 'e1', assigneeIds: ['e3'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 480, actualMinutes: 360, priority: 'high', status: 'in_progress', progressNotes: 'Login flow complete, working on password reset', isOverdue: false, statusHistory: [{ id: 'sh1', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }, { id: 'sh2', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e3', changedAt: today }], timeEntries: [{ id: 'te1', taskId: 't1', employeeId: 'e3', workDate: today, durationMinutes: 360, description: 'Implemented OAuth flow', createdAt: today }] },
  { id: 't2', taskId: 'TSK002', title: 'Design product listing page', description: 'Create responsive product listing with filters', projectId: 'p1', milestoneId: 'm2', creatorId: 'e1', assigneeIds: ['e2'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 360, actualMinutes: 360, priority: 'high', status: 'completed', completedAt: today, progressNotes: 'Design approved by client', isOverdue: false, statusHistory: [{ id: 'sh3', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }, { id: 'sh4', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e2', changedAt: today }, { id: 'sh5', fromStatus: 'in_progress', toStatus: 'completed', changedBy: 'e2', changedAt: today }], timeEntries: [{ id: 'te2', taskId: 't2', employeeId: 'e2', workDate: today, durationMinutes: 360, createdAt: today }] },
  { id: 't3', taskId: 'TSK003', title: 'Write API unit tests', description: 'Cover authentication and user endpoints', projectId: 'p1', creatorId: 'e1', assigneeIds: ['e4'], scheduledDate: today, createdAt: twoDaysAgo, dueDate: today, estimatedMinutes: 240, actualMinutes: 120, priority: 'medium', status: 'in_progress', progressNotes: 'Auth tests done, user tests pending', isOverdue: false, statusHistory: [{ id: 'sh6', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: twoDaysAgo }, { id: 'sh7', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e4', changedAt: today }], timeEntries: [{ id: 'te3', taskId: 't3', employeeId: 'e4', workDate: today, durationMinutes: 120, createdAt: today }] },
  { id: 't4', taskId: 'TSK004', title: 'Setup push notifications', description: 'Integrate Firebase push notifications', projectId: 'p2', creatorId: 'e5', assigneeIds: ['e6'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 300, actualMinutes: 0, priority: 'high', status: 'on_hold', blockerReason: 'Waiting for Firebase project approval', isOverdue: false, statusHistory: [{ id: 'sh8', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: yesterday }, { id: 'sh9', fromStatus: 'planned', toStatus: 'on_hold', changedBy: 'e6', changedAt: today, reason: 'Waiting for Firebase project approval' }], timeEntries: [] },
  { id: 't5', taskId: 'TSK005', title: 'Implement biometric login', description: 'Face ID and fingerprint authentication', projectId: 'p2', creatorId: 'e5', assigneeIds: ['e6'], scheduledDate: yesterday, createdAt: twoDaysAgo, dueDate: yesterday, estimatedMinutes: 480, actualMinutes: 240, priority: 'high', status: 'in_progress', isOverdue: true, originalScheduledDate: yesterday, statusHistory: [{ id: 'sh10', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: twoDaysAgo }, { id: 'sh11', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e6', changedAt: yesterday }], timeEntries: [{ id: 'te4', taskId: 't5', employeeId: 'e6', workDate: yesterday, durationMinutes: 240, createdAt: yesterday }] },
  { id: 't6', taskId: 'TSK006', title: 'Leave request module UI', description: 'Build leave request form and approval flow', projectId: 'p3', creatorId: 'e1', assigneeIds: ['e2'], scheduledDate: twoDaysAgo, createdAt: twoDaysAgo, dueDate: twoDaysAgo, estimatedMinutes: 360, actualMinutes: 360, priority: 'medium', status: 'completed', completedAt: twoDaysAgo, isOverdue: false, statusHistory: [{ id: 'sh12', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: twoDaysAgo }, { id: 'sh13', fromStatus: 'planned', toStatus: 'completed', changedBy: 'e2', changedAt: twoDaysAgo }], timeEntries: [{ id: 'te5', taskId: 't6', employeeId: 'e2', workDate: twoDaysAgo, durationMinutes: 360, createdAt: twoDaysAgo }] },
  { id: 't7', taskId: 'TSK007', title: 'Database schema optimization', description: 'Optimize queries and add indexes', projectId: 'p3', creatorId: 'e1', assigneeIds: ['e3'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 240, actualMinutes: 0, priority: 'low', status: 'planned', isOverdue: false, statusHistory: [{ id: 'sh14', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }], timeEntries: [] },
  { id: 't8', taskId: 'TSK008', title: 'Mobile app onboarding screens', description: 'Design and implement onboarding flow', projectId: 'p2', creatorId: 'e5', assigneeIds: ['e8'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 360, actualMinutes: 180, priority: 'medium', status: 'in_progress', isOverdue: false, statusHistory: [{ id: 'sh15', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: yesterday }, { id: 'sh16', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e8', changedAt: today }], timeEntries: [{ id: 'te6', taskId: 't8', employeeId: 'e8', workDate: today, durationMinutes: 180, createdAt: today }] },
  // Additional tasks for more test data
  { id: 't9', taskId: 'TSK009', title: 'Payment gateway integration', description: 'Integrate Stripe payment gateway', projectId: 'p1', creatorId: 'e1', assigneeIds: ['e3'], scheduledDate: yesterday, createdAt: twoDaysAgo, dueDate: today, estimatedMinutes: 600, actualMinutes: 420, priority: 'critical', status: 'in_progress', isOverdue: false, statusHistory: [{ id: 'sh17', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: twoDaysAgo }, { id: 'sh18', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e3', changedAt: yesterday }], timeEntries: [{ id: 'te7', taskId: 't9', employeeId: 'e3', workDate: yesterday, durationMinutes: 420, createdAt: yesterday }] },
  { id: 't10', taskId: 'TSK010', title: 'Shopping cart UI', description: 'Design and implement shopping cart interface', projectId: 'p1', creatorId: 'e1', assigneeIds: ['e2'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 300, actualMinutes: 300, priority: 'high', status: 'completed', completedAt: today, isOverdue: false, statusHistory: [{ id: 'sh19', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }, { id: 'sh20', fromStatus: 'planned', toStatus: 'completed', changedBy: 'e2', changedAt: today }], timeEntries: [{ id: 'te8', taskId: 't10', employeeId: 'e2', workDate: today, durationMinutes: 300, createdAt: today }] },
  { id: 't11', taskId: 'TSK011', title: 'Transaction history API', description: 'Build API for transaction history', projectId: 'p2', creatorId: 'e5', assigneeIds: ['e3'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 360, actualMinutes: 0, priority: 'high', status: 'planned', isOverdue: false, statusHistory: [{ id: 'sh21', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: yesterday }], timeEntries: [] },
  { id: 't12', taskId: 'TSK012', title: 'Attendance report generation', description: 'Generate monthly attendance reports', projectId: 'p3', creatorId: 'e1', assigneeIds: ['e3'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 240, actualMinutes: 120, priority: 'medium', status: 'in_progress', isOverdue: false, statusHistory: [{ id: 'sh22', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }, { id: 'sh23', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e3', changedAt: today }], timeEntries: [{ id: 'te9', taskId: 't12', employeeId: 'e3', workDate: today, durationMinutes: 120, createdAt: today }] },
  { id: 't13', taskId: 'TSK013', title: 'Dashboard charts implementation', description: 'Implement D3.js charts for analytics', projectId: 'p4', creatorId: 'e5', assigneeIds: ['e3'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 480, actualMinutes: 0, priority: 'medium', status: 'planned', isOverdue: false, statusHistory: [{ id: 'sh24', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: yesterday }], timeEntries: [] },
  { id: 't14', taskId: 'TSK014', title: 'User profile settings', description: 'Build user profile settings page', projectId: 'p3', creatorId: 'e1', assigneeIds: ['e2'], scheduledDate: today, createdAt: yesterday, dueDate: today, estimatedMinutes: 240, actualMinutes: 240, priority: 'low', status: 'completed', completedAt: today, isOverdue: false, statusHistory: [{ id: 'sh25', fromStatus: null, toStatus: 'planned', changedBy: 'e1', changedAt: yesterday }, { id: 'sh26', fromStatus: 'planned', toStatus: 'completed', changedBy: 'e2', changedAt: today }], timeEntries: [{ id: 'te10', taskId: 't14', employeeId: 'e2', workDate: today, durationMinutes: 240, createdAt: today }] },
  { id: 't15', taskId: 'TSK015', title: 'Security audit preparation', description: 'Prepare documentation for security audit', projectId: 'p2', creatorId: 'e5', assigneeIds: ['e4'], scheduledDate: yesterday, createdAt: twoDaysAgo, dueDate: yesterday, estimatedMinutes: 360, actualMinutes: 180, priority: 'critical', status: 'in_progress', isOverdue: true, originalScheduledDate: yesterday, statusHistory: [{ id: 'sh27', fromStatus: null, toStatus: 'planned', changedBy: 'e5', changedAt: twoDaysAgo }, { id: 'sh28', fromStatus: 'planned', toStatus: 'in_progress', changedBy: 'e4', changedAt: yesterday }], timeEntries: [{ id: 'te11', taskId: 't15', employeeId: 'e4', workDate: yesterday, durationMinutes: 180, createdAt: yesterday }] },
];

export const attendanceRecords: AttendanceRecord[] = [
  { id: 'a1', employeeId: 'e1', workDate: today, checkInAt: `${today}T09:02:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: true },
  { id: 'a2', employeeId: 'e2', workDate: today, checkInAt: `${today}T09:15:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: true, isMissingCheckout: true },
  { id: 'a3', employeeId: 'e3', workDate: today, checkInAt: `${today}T08:55:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: true },
  { id: 'a4', employeeId: 'e4', workDate: today, checkInAt: `${today}T09:30:00`, checkOutAt: undefined, status: 'late', source: 'automatic_login', isLate: true, isMissingCheckout: true },
  { id: 'a5', employeeId: 'e5', workDate: today, checkInAt: `${today}T08:45:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: true },
  { id: 'a6', employeeId: 'e6', workDate: today, checkInAt: undefined, checkOutAt: undefined, status: 'absent', source: 'automatic_login', isLate: false, isMissingCheckout: false },
  { id: 'a7', employeeId: 'e7', workDate: today, checkInAt: `${today}T09:00:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: true },
  { id: 'a8', employeeId: 'e8', workDate: today, checkInAt: `${today}T09:10:00`, checkOutAt: undefined, status: 'present', source: 'automatic_login', isLate: true, isMissingCheckout: true },
  { id: 'a9', employeeId: 'e1', workDate: yesterday, checkInAt: `${yesterday}T09:00:00`, checkOutAt: `${yesterday}T18:05:00`, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: false },
  { id: 'a10', employeeId: 'e2', workDate: yesterday, checkInAt: `${yesterday}T09:05:00`, checkOutAt: `${yesterday}T18:10:00`, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: false },
  { id: 'a11', employeeId: 'e3', workDate: yesterday, checkInAt: `${yesterday}T08:50:00`, checkOutAt: `${yesterday}T18:00:00`, status: 'present', source: 'automatic_login', isLate: false, isMissingCheckout: false },
];

export const notifications: Notification[] = [
  { id: 'n1', userId: 'u1', type: 'task_completed', title: 'Task Completed', message: 'Priya completed "Design product listing page"', entityId: 't2', entityType: 'task', isRead: false, createdAt: today + 'T14:30:00' },
  { id: 'n2', userId: 'u1', type: 'deadline_approaching', title: 'Deadline Approaching', message: 'Project "E-Commerce Platform" milestone due in 3 days', entityId: 'p1', entityType: 'project', isRead: false, createdAt: today + 'T09:00:00' },
  { id: 'n3', userId: 'u1', type: 'leave_approved', title: 'Leave Approved', message: 'Your leave request for March 20 has been approved', entityId: 'l1', entityType: 'leave', isRead: true, createdAt: yesterday + 'T16:00:00' },
  { id: 'n4', userId: 'u2', type: 'task_assigned', title: 'New Task Assigned', message: 'You have been assigned "Design checkout flow"', entityId: 't_new', entityType: 'task', isRead: false, createdAt: today + 'T10:00:00' },
  { id: 'n5', userId: 'u1', type: 'mention', title: 'You were mentioned', message: 'Vikram mentioned you in Mobile Banking App chat', entityId: 'msg1', entityType: 'message', isRead: false, createdAt: today + 'T11:30:00' },
];

export const projectMessages: ProjectMessage[] = [
  { id: 'msg1', projectId: 'p1', senderId: 'e1', content: 'Team, the client has approved the new design direction. Let\'s proceed with implementation.', isPinned: true, mentions: [], attachments: [], createdAt: today + 'T09:30:00', isDeleted: false },
  { id: 'msg2', projectId: 'p1', senderId: 'e2', content: 'Great news! I\'ll update the Figma files with the approved changes by EOD.', replyToId: 'msg1', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T09:45:00', isDeleted: false },
  { id: 'msg3', projectId: 'p1', senderId: 'e3', content: '@Rajesh Kumar I\'ve pushed the auth module to staging. Can you review?', isPinned: false, mentions: ['e1'], attachments: [], createdAt: today + 'T11:00:00', isDeleted: false },
  { id: 'msg4', projectId: 'p1', senderId: 'e1', content: 'Looks good @Amit Patel! Just a few minor comments on the PR.', replyToId: 'msg3', isPinned: false, mentions: ['e3'], attachments: [], createdAt: today + 'T11:30:00', isDeleted: false },
  { id: 'msg5', projectId: 'p2', senderId: 'e5', content: 'Reminder: Sprint review tomorrow at 3 PM. Please update your task statuses.', isPinned: true, mentions: [], attachments: [], createdAt: today + 'T10:00:00', isDeleted: false },
  { id: 'msg6', projectId: 'p2', senderId: 'e6', content: 'Push notification setup is blocked. Waiting for Firebase project approval from the client.', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T10:30:00', isDeleted: false },
  // Additional messages for more test data
  { id: 'msg7', projectId: 'p1', senderId: 'e4', content: 'I\'ve completed the test cases for the authentication module. All tests are passing.', replyToId: 'msg4', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T12:00:00', isDeleted: false },
  { id: 'msg8', projectId: 'p1', senderId: 'e2', content: 'Figma files have been updated. Please check the latest version.', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T13:15:00', isDeleted: false },
  { id: 'msg9', projectId: 'p2', senderId: 'e8', content: 'Onboarding screens are 50% complete. Will finish by tomorrow.', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T11:45:00', isDeleted: false },
  { id: 'msg10', projectId: 'p2', senderId: 'e5', content: '@Ananya Gupta Great progress! Keep it up.', replyToId: 'msg9', isPinned: false, mentions: ['e8'], attachments: [], createdAt: today + 'T12:30:00', isDeleted: false },
  { id: 'msg11', projectId: 'p3', senderId: 'e1', content: 'HR Portal attendance module is almost done. Need final testing.', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T10:15:00', isDeleted: false },
  { id: 'msg12', projectId: 'p3', senderId: 'e3', content: 'Database optimization is in progress. Should be done by EOD.', isPinned: false, mentions: [], attachments: [], createdAt: today + 'T11:20:00', isDeleted: false },
  { id: 'msg13', projectId: 'p4', senderId: 'e5', content: 'Analytics dashboard project is on hold until further notice.', isPinned: true, mentions: [], attachments: [], createdAt: today + 'T09:00:00', isDeleted: false },
];

export const announcements: Announcement[] = [
  { id: 'ann1', title: 'Company Holiday - Holi Festival', content: 'The office will remain closed on March 25th for Holi festival. Wishing everyone a happy and colorful Holi!', audience: 'all', publishedAt: '2024-03-18T10:00:00', expiresAt: '2024-03-26T00:00:00', attachments: [], createdBy: 'e7' },
  { id: 'ann2', title: 'New Work From Home Policy', content: 'Starting April 1st, employees can work from home up to 2 days per week with manager approval. Please check the HR portal for details.', audience: 'all', publishedAt: '2024-03-15T09:00:00', attachments: [], createdBy: 'e7' },
];

export const leaveTypes: LeaveType[] = [
  { id: 'lt1', name: 'Casual Leave', maxDaysPerYear: 12, isPaid: true },
  { id: 'lt2', name: 'Sick Leave', maxDaysPerYear: 12, isPaid: true },
  { id: 'lt3', name: 'Earned Leave', maxDaysPerYear: 15, isPaid: true },
  { id: 'lt4', name: 'Unpaid Leave', isPaid: false },
];

export const leaveRequests: LeaveRequest[] = [
  { id: 'l1', employeeId: 'e2', leaveTypeId: 'lt1', startDate: '2024-03-25', endDate: '2024-03-26', duration: 'full_day', reason: 'Holi festival celebrations', status: 'approved', approverId: 'e1', decisionAt: '2024-03-18T14:00:00', createdAt: '2024-03-17T10:00:00' },
  { id: 'l2', employeeId: 'e6', leaveTypeId: 'lt2', startDate: '2024-03-20', endDate: '2024-03-20', duration: 'full_day', reason: 'Not feeling well', status: 'pending', createdAt: '2024-03-19T08:00:00' },
  { id: 'l3', employeeId: 'e4', leaveTypeId: 'lt3', startDate: '2024-04-01', endDate: '2024-04-05', duration: 'full_day', reason: 'Family vacation', status: 'pending', createdAt: '2024-03-18T16:00:00' },
];

export const dailyReports: DailyWorkReport[] = [
  { id: 'dr1', employeeId: 'e1', reportDate: yesterday, generatedAt: yesterday + 'T18:30:00', isComplete: true, attendanceStatus: 'present', items: [
    { id: 'dri1', taskId: 't6', taskTitle: 'Leave request module UI', projectName: 'HR Portal', statusAtCutoff: 'completed', currentStatus: 'completed', completedAt: twoDaysAgo, estimatedMinutes: 360, actualMinutes: 360, isCarriedForward: false },
    { id: 'dri2', taskId: 't1', taskTitle: 'Implement user authentication flow', projectName: 'E-Commerce Platform', statusAtCutoff: 'planned', currentStatus: 'in_progress', estimatedMinutes: 480, actualMinutes: 0, isCarriedForward: true, originalScheduledDate: yesterday },
  ]},
  { id: 'dr2', employeeId: 'e2', reportDate: yesterday, generatedAt: yesterday + 'T18:30:00', isComplete: true, attendanceStatus: 'present', items: [
    { id: 'dri3', taskId: 't2', taskTitle: 'Design product listing page', projectName: 'E-Commerce Platform', statusAtCutoff: 'in_progress', currentStatus: 'completed', estimatedMinutes: 360, actualMinutes: 200, isCarriedForward: false },
  ]},
  { id: 'dr3', employeeId: 'e3', reportDate: yesterday, generatedAt: yesterday + 'T18:30:00', isComplete: true, attendanceStatus: 'present', items: [
    { id: 'dri4', taskId: 't1', taskTitle: 'Implement user authentication flow', projectName: 'E-Commerce Platform', statusAtCutoff: 'in_progress', currentStatus: 'in_progress', estimatedMinutes: 480, actualMinutes: 300, isCarriedForward: false },
    { id: 'dri5', taskId: 't7', taskTitle: 'Database schema optimization', projectName: 'HR Portal', statusAtCutoff: 'planned', currentStatus: 'planned', estimatedMinutes: 240, actualMinutes: 0, isCarriedForward: true, originalScheduledDate: yesterday },
  ]},
];

export const companySettings: CompanySettings = {
  id: 'cs1', companyName: 'TechCorp Solutions', timezone: 'Asia/Kolkata', reportingCutoffTime: '18:30', workingDays: [1,2,3,4,5], reminderIntervals: [30, 15], maxTimeEntryMinutes: 720, minTimeEntryMinutes: 5,
};

export const dashboardMetrics: DashboardMetrics = {
  totalEmployees: 8, activeEmployees: 8, presentToday: 6, absentToday: 1, onLeaveToday: 0, notCheckedIn: 1,
  activeProjects: 3, completedProjects: 1, delayedProjects: 1,
  plannedTasks: 1, completedTasks: 2, overdueTasks: 1, blockedTasks: 1,
  pendingLeaveRequests: 2, incompleteReports: 0, projectsDueThisWeek: 0,
  upcomingMilestones: [
    { id: 'm2', title: 'Frontend MVP', dueDate: '2024-04-30', status: 'in_progress' },
    { id: 'm9', title: 'Attendance Module', dueDate: '2024-04-30', status: 'in_progress' },
    { id: 'm6', title: 'Core Features', dueDate: '2024-05-30', status: 'in_progress' },
  ],
};

export const getEmployeeName = (id: string): string => {
  const emp = employees.find(e => e.id === id);
  return emp ? `${emp.firstName} ${emp.lastName}` : 'Unknown';
};

export const getProjectName = (id: string): string => {
  const proj = projects.find(p => p.id === id);
  return proj ? proj.title : 'Unknown Project';
};
