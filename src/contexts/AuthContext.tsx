
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { User } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }, options?: { onError?: (error: Error) => void }) => Promise<void>;
  register: (userData: Partial<User>) => Promise<void>;
  logout: () => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  isEmployee: boolean;
  isManager: boolean;
  isWorkFlowManagement: boolean;
  isDeveloper: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await authApi.getCurrentUser();
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (data: { email: string; password: string }, options?: { onError?: (error: Error) => void }) => {
    setIsLoggingIn(true);
    try {
      const response = await authApi.login(data.email, data.password);
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      const errorMessage = error.message || 'An error occurred during login';
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      if (options?.onError) {
        options.onError(error);
      }
      throw error;
    } finally {
      setIsLoggingIn(false);
    }
  };

  const register = async (userData: Partial<User>) => {
    setIsRegistering(true);
    try {
      const response = await authApi.register(userData);
      localStorage.setItem('authToken', response.data.token);
      setUser(response.data.user);
      toast({
        title: 'Registration successful',
        description: 'Welcome to SmartSwap!',
      });
    } catch (error: any) {
      toast({
        title: 'Registration failed',
        description: error.message || 'An error occurred during registration',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsRegistering(false);
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout API call failed:', error);
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
      // Force page reload to ensure clean state
      window.location.reload();
    }
  };

  const hasRole = (roles: string | string[]) => {
    if (!user) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(user.role);
  };

  const isAuthenticated = !!user;
  const isEmployee = hasRole('Employee');
  const isManager = hasRole(['Manager', 'WorkFlowManagement', 'Developer']);
  const isWorkFlowManagement = hasRole(['WorkFlowManagement', 'Developer']);
  const isDeveloper = hasRole('Developer');

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggingIn,
    isRegistering,
    isAuthenticated,
    login,
    register,
    logout,
    hasRole,
    isEmployee,
    isManager,
    isWorkFlowManagement,
    isDeveloper,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
