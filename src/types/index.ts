// ============================================
// CORE TYPES - Employee & Project Management System
// ============================================

export type UserRole = 'admin' | 'employee';

export interface Permission {
  id: string;
  name: string;
  description: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
}

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  userId: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  profilePhoto?: string;
  username: string;
  password?: string;
  email?: string;
  phone?: string;
  gender?: 'male' | 'female' | 'other';
  dateOfBirth?: string;
  emergencyContact?: string;
  joiningDate: string;
  designation: string;
  department: string;
  team?: string;
  reportingManager?: string;
  role: UserRole;
  status: 'active' | 'inactive' | 'on_leave' | 'terminated';
  workSchedule: WorkSchedule;
  expectedWorkingHours: number;
  skills?: string[];
}

export interface WorkSchedule {
  id: string;
  name: string;
  workDays: number[]; // 0=Sun, 1=Mon, etc.
  startTime: string;
  endTime: string;
  timezone: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
}

export interface Team {
  id: string;
  name: string;
  departmentId: string;
  leadId?: string;
  members: string[];
}

export type ProjectStatus = 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high' | 'critical';

export interface Project {
  id: string;
  projectId: string;
  title: string;
  description: string;
  requirements?: string;
  clientReference?: string;
  technologyStack?: string[];
  projectManagerId: string;
  members: ProjectMember[];
  startDate: string;
  targetDeliveryDate?: string;
  actualCompletionDate?: string;
  priority: ProjectPriority;
  status: ProjectStatus;
  milestones: Milestone[];
  estimatedHours: number;
  actualHours: number;
  budget?: number;
  progress: number;
  attachments: ProjectAttachment[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectAttachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url?: string;
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProjectMember {
  id: string;
  employeeId: string;
  role: 'manager' | 'developer' | 'designer' | 'tester' | 'viewer';
  joinedAt: string;
}

export interface Milestone {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  completedAt?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'overdue';
}

export type TaskStatus = 'planned' | 'in_progress' | 'completed' | 'on_hold' | 'cancelled';

export interface Task {
  id: string;
  taskId: string;
  title: string;
  description?: string;
  acceptanceCriteria?: string;
  projectId: string;
  milestoneId?: string;
  creatorId: string;
  assigneeIds: string[];
  reviewerId?: string;
  scheduledDate: string;
  createdAt: string;
  dueDate?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  priority: ProjectPriority;
  status: TaskStatus;
  progressNotes?: string;
  completedAt?: string;
  completionNotes?: string;
  blockerReason?: string;
  isOverdue: boolean;
  originalScheduledDate?: string;
  rescheduledFrom?: string;
  rescheduleReason?: string;
  checklist?: ChecklistItem[];
  dependencies?: string[];
  statusHistory: TaskStatusEvent[];
  timeEntries: TimeEntry[];
}

export interface ChecklistItem {
  id: string;
  title: string;
  isCompleted: boolean;
}

export interface TaskStatusEvent {
  id: string;
  fromStatus: TaskStatus | null;
  toStatus: TaskStatus;
  changedBy: string;
  changedAt: string;
  reason?: string;
}

export interface TimeEntry {
  id: string;
  taskId: string;
  employeeId: string;
  workDate: string;
  durationMinutes: number;
  description?: string;
  createdAt: string;
  updatedAt?: string;
  correctionReason?: string;
}

export interface ProjectMessage {
  id: string;
  projectId: string;
  senderId: string;
  content: string;
  replyToId?: string;
  isPinned: boolean;
  linkedTaskId?: string;
  mentions: string[];
  attachments: ProjectAttachment[];
  createdAt: string;
  updatedAt?: string;
  editedAt?: string;
  isDeleted: boolean;
}

export interface Attachment {
  id: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_completed' | 'task_reopened' | 'message' | 'mention' | 'project_update' | 'leave_approved' | 'leave_rejected' | 'announcement' | 'report_ready' | 'deadline_approaching';
  title: string;
  message: string;
  entityId?: string;
  entityType?: string;
  isRead: boolean;
  createdAt: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half_day' | 'on_leave' | 'holiday';

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  workDate: string;
  checkInAt?: string;
  checkOutAt?: string;
  status: AttendanceStatus;
  source: 'automatic_login' | 'manual' | 'correction';
  isLate: boolean;
  isMissingCheckout: boolean;
  notes?: string;
}

export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveDuration = 'full_day' | 'first_half' | 'second_half' | 'morning_short' | 'evening_short';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  duration: LeaveDuration;
  reason: string;
  status: LeaveStatus;
  approverId?: string;
  decisionAt?: string;
  decisionNotes?: string;
  createdAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  description?: string;
  maxDaysPerYear?: number;
  isPaid: boolean;
}

export interface DailyWorkReport {
  id: string;
  employeeId: string;
  reportDate: string;
  generatedAt: string;
  items: DailyReportItem[];
  isComplete: boolean;
  attendanceStatus: AttendanceStatus;
}

export interface DailyReportItem {
  id: string;
  taskId: string;
  taskTitle: string;
  projectName: string;
  statusAtCutoff: TaskStatus;
  currentStatus: TaskStatus;
  completedAt?: string;
  estimatedMinutes: number;
  actualMinutes: number;
  isCarriedForward: boolean;
  originalScheduledDate?: string;
  blockerReason?: string;
  notes?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  audience: 'all' | 'department' | 'team' | 'project';
  audienceId?: string;
  publishedAt: string;
  expiresAt?: string;
  attachments: Attachment[];
  createdBy: string;
}

export interface ActivityLog {
  id: string;
  actorId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValue?: Record<string, any>;
  newValue?: Record<string, any>;
  reason?: string;
  createdAt: string;
}

export interface CompanySettings {
  id: string;
  companyName: string;
  timezone: string;
  reportingCutoffTime: string;
  workingDays: number[];
  reminderIntervals: number[];
  maxTimeEntryMinutes: number;
  minTimeEntryMinutes: number;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
}

export interface DashboardMetrics {
  totalEmployees: number;
  activeEmployees: number;
  presentToday: number;
  absentToday: number;
  onLeaveToday: number;
  notCheckedIn: number;
  activeProjects: number;
  completedProjects: number;
  delayedProjects: number;
  plannedTasks: number;
  completedTasks: number;
  overdueTasks: number;
  blockedTasks: number;
  pendingLeaveRequests: number;
  incompleteReports: number;
  projectsDueThisWeek: number;
  upcomingMilestones: Milestone[];
}

export type DateFilter = 'today' | 'yesterday' | 'this_week' | 'last_week' | 'this_month' | 'last_month' | 'custom';
