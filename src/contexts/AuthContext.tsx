
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';
import { User as ApiUser } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  role: 'Employee' | 'Manager' | 'WorkFlowManagement' | 'Developer';
  skills: string[];
  marketplace: string;
  email: string;
}

// Map the backend User shape (camelCase, _id) onto the UserProfile the UI expects.
const toProfile = (u: ApiUser): UserProfile => ({
  id: u._id,
  first_name: u.firstName,
  last_name: u.lastName,
  role: u.role,
  skills: u.skills || [],
  marketplace: u.marketplace,
  email: u.email,
});

interface AuthContextType {
  user: ApiUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isLoggingIn: boolean;
  isRegistering: boolean;
  isAuthenticated: boolean;
  login: (data: { email: string; password: string }, options?: { onError?: (error: Error) => void }) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    skills: string[];
    marketplace: string;
  }) => Promise<void>;
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
  const [user, setUser] = useState<ApiUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  // Restore the session from a stored JWT on mount.
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const res = await authApi.getCurrentUser();
        if (res.data) {
          setUser(res.data);
          setUserProfile(toProfile(res.data));
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.removeItem('authToken');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = async (data: { email: string; password: string }, options?: { onError?: (error: Error) => void }) => {
    setIsLoggingIn(true);
    try {
      const res = await authApi.login(data.email, data.password);
      const { user: apiUser, token } = res.data;
      localStorage.setItem('authToken', token);
      setUser(apiUser);
      setUserProfile(toProfile(apiUser));

      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    } catch (error: any) {
      console.error('Login error:', error);
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

  const register = async (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    skills: string[];
    marketplace: string;
  }) => {
    setIsRegistering(true);
    try {
      const res = await authApi.register(userData as unknown as Partial<ApiUser>);
      const { user: apiUser, token } = res.data;
      if (token) localStorage.setItem('authToken', token);
      if (apiUser) {
        setUser(apiUser);
        setUserProfile(toProfile(apiUser));
      }

      toast({
        title: 'Registration successful',
        description: 'Welcome to SmartSwap!',
      });
    } catch (error: any) {
      console.error('Registration error:', error);
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
      await authApi.logout().catch(() => {});
    } finally {
      localStorage.removeItem('authToken');
      setUser(null);
      setUserProfile(null);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    }
  };

  const hasRole = (roles: string | string[]) => {
    if (!userProfile) return false;
    const roleArray = Array.isArray(roles) ? roles : [roles];
    return roleArray.includes(userProfile.role);
  };

  const isAuthenticated = !!user;
  const isEmployee = hasRole('Employee');
  const isManager = hasRole(['Manager', 'WorkFlowManagement', 'Developer']);
  const isWorkFlowManagement = hasRole(['WorkFlowManagement', 'Developer']);
  const isDeveloper = hasRole('Developer');

  const value: AuthContextType = {
    user,
    userProfile,
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
