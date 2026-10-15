import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';
import { useTheme } from '../contexts/ThemeContext';
import { LayoutDashboard, Users, FolderKanban, CheckSquare, Clock, MessageSquare, FileText, Bell, Settings, LogOut, Menu, X, ChevronDown, Search, Building2, Megaphone, Sun, Moon } from 'lucide-react';

interface LayoutProps { children: React.ReactNode; }

const adminNav = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/employees', label: 'Employees', icon: Users },
  { path: '/projects', label: 'Projects', icon: FolderKanban },
  { path: '/tasks', label: 'Tasks', icon: CheckSquare },
  { path: '/attendance', label: 'Attendance', icon: Clock },
  { path: '/leave', label: 'Leave Management', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/reports', label: 'Reports', icon: FileText },
  { path: '/announcements', label: 'Announcements', icon: Megaphone },
  { path: '/settings', label: 'Settings', icon: Settings },
];

const employeeNav = [
  { path: '/my-dashboard', label: 'My Dashboard', icon: LayoutDashboard },
  { path: '/my-projects', label: 'My Projects', icon: FolderKanban },
  { path: '/my-tasks', label: 'Daily Planner', icon: CheckSquare },
  { path: '/my-attendance', label: 'Attendance', icon: Clock },
  { path: '/my-leave', label: 'Leave Requests', icon: FileText },
  { path: '/chat', label: 'Chat', icon: MessageSquare },
  { path: '/my-reports', label: 'Work History', icon: FileText },
];

export default function Layout({ children }: LayoutProps) {
  const { user, employee, logout, isManager } = useAuth();
  const { notifications, markNotificationRead } = useData();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const navItems = isManager ? adminNav : employeeNav;
  const userNotifs = notifications.filter(n => n.userId === user?.id);
  const unreadCount = userNotifs.filter(n => !n.isRead).length;

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => { logout(); navigate('/login'); };

  const handleNotificationClick = (notifId: string) => {
    markNotificationRead(notifId);
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-emerald-700 via-emerald-800 to-green-900 text-white transform transition-transform duration-200 lg:translate-x-0 lg:static lg:in-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} shadow-xl`}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">WorkForce Pro</h1>
            <p className="text-xs text-emerald-200">Management System</p>
          </div>
        </div>
        <nav className="px-3 py-4 space-y-1 overflow-y-auto h-[calc(100vh-180px)]">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link key={item.path} to={item.path} onClick={() => setSidebarOpen(false)}
                className={`sidebar-link ${isActive ? 'bg-white/20 text-white shadow-sm' : 'text-emerald-100 hover:text-white hover:bg-white/10'}`}>
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-emerald-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold backdrop-blur-sm">
              {employee?.firstName?.[0]}{employee?.lastName?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{employee?.firstName} {employee?.lastName}</p>
              <p className="text-xs text-emerald-200 truncate">{employee?.designation}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 px-4 lg:px-6 py-3 flex items-center gap-4 sticky top-0 z-30 flex-shrink-0">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700">
            <Menu className="w-5 h-5 text-gray-600 dark:text-slate-300" />
          </button>
          
          <div className="flex-1 max-w-md relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-slate-600 text-gray-900 dark:text-slate-100 placeholder-gray-500 dark:placeholder-slate-400" />
          </div>

          <div className="flex items-center gap-2 ml-auto">
            {/* Theme Toggle */}
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors" title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
              {theme === 'light' ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </button>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setShowNotifications(!showNotifications); setShowProfile(false); }}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <Bell className="w-5 h-5 text-gray-600 dark:text-slate-300" />
                {unreadCount > 0 && (
                  <>
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">{unreadCount}</span>
                    <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 rounded-full notification-pulse"></span>
                  </>
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-900 dark:text-slate-100">Notifications</h3>
                    {unreadCount > 0 && <span className="badge bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300">{unreadCount} unread</span>}
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {userNotifs.length === 0 ? (
                      <p className="px-4 py-8 text-sm text-gray-500 dark:text-slate-400 text-center">No notifications</p>
                    ) : userNotifs.map(n => (
                      <div key={n.id} onClick={() => handleNotificationClick(n.id)}
                        className={`px-4 py-3 border-b border-gray-50 dark:border-slate-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors ${!n.isRead ? 'bg-emerald-50 dark:bg-emerald-900/20' : ''}`}>
                        <div className="flex items-start gap-3">
                          {!n.isRead && <div className="w-2 h-2 rounded-full bg-emerald-500 mt-2 flex-shrink-0"></div>}
                          <div className="flex-1">
                            <p className={`text-sm ${!n.isRead ? 'font-bold text-gray-900 dark:text-slate-100' : 'font-medium text-gray-700 dark:text-slate-300'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{n.message}</p>
                            <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{new Date(n.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Profile */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => { setShowProfile(!showProfile); setShowNotifications(false); }}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center text-white text-sm font-bold shadow-sm">
                  {employee?.firstName?.[0]}{employee?.lastName?.[0]}
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500 dark:text-slate-400 hidden sm:block" />
              </button>
              {showProfile && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 overflow-hidden z-50 fade-in">
                  <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-700 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/30 dark:to-green-900/30">
                    <p className="text-sm font-semibold text-gray-900 dark:text-slate-100">{employee?.firstName} {employee?.lastName}</p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">@{employee?.username}</p>
                    {employee?.email && <p className="text-xs text-gray-400 dark:text-slate-500">{employee.email}</p>}
                    <span className="inline-block px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs rounded-full mt-1 font-medium">{user?.role?.replace('_', ' ')}</span>
                  </div>
                  <div className="py-1">
                    <button onClick={() => { navigate('/profile'); setShowProfile(false); }} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-slate-300">My Profile</button>
                    <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2">
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gray-50 dark:bg-slate-900">
          {children}
        </main>
      </div>
    </div>
  );
}
