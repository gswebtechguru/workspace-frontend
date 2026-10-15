import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { User, UserRole, Employee } from '../types';
import { employees } from '../data/mockData';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; redirectPath: string }>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  isAdmin: boolean;
  isManager: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['*'],
  employee: ['tasks.view','tasks.create','tasks.complete','time_entries.create','reports.view_own','chat.send','notifications.view','attendance.view','leave.create','projects.view'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);

  const login = useCallback(async (loginUsername: string, _password: string): Promise<{ success: boolean; redirectPath: string }> => {
    const emp = employees.find(e => 
      e.username.toLowerCase() === loginUsername.toLowerCase() || 
      (e.email && e.email.toLowerCase() === loginUsername.toLowerCase()) || 
      e.employeeId.toLowerCase() === loginUsername.toLowerCase()
    );
    if (!emp) return { success: false, redirectPath: '/login' };
    if (emp.status !== 'active') return { success: false, redirectPath: '/login' };
    
    const mockUser: User = {
      id: emp.userId,
      username: emp.username,
      email: emp.email || '',
      role: emp.role,
      isActive: true,
      lastLoginAt: new Date().toISOString(),
      createdAt: emp.joiningDate,
    };
    
    setUser(mockUser);
    setEmployee(emp);
    
    // Determine redirect based on role
    const isAdminRole = emp.role === 'admin';
    const redirectPath = isAdminRole ? '/dashboard' : '/my-dashboard';
    
    return { success: true, redirectPath };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setEmployee(null);
  }, []);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;
    const perms = rolePermissions[user.role] || [];
    if (perms.includes('*')) return true;
    return perms.includes(permission);
  }, [user]);

  const isAdmin = user?.role === 'admin';
  const isManager = isAdmin;

  return (
    <AuthContext.Provider value={{ user, employee, isAuthenticated: !!user, login, logout, hasPermission, isAdmin, isManager }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
