
import { ApiResponse, User, AuthResponse, Schedule, Shift, SwapRequest, AnalyticsData } from '@/types/api';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

// Generic API request function
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem('authToken');
  
  const config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API request error:', error);
    throw error;
  }
}

// Authentication API
export const authApi = {
  login: async (email: string, password: string): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (userData: Partial<User>): Promise<ApiResponse<AuthResponse>> => {
    return apiRequest<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  logout: async (): Promise<ApiResponse<null>> => {
    return apiRequest<null>('/auth/logout', {
      method: 'POST',
    });
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return apiRequest<User>('/auth/me');
  },
};

// User management API
export const userApi = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return apiRequest<User[]>('/users');
  },

  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`);
  },

  updateUser: async (userId: string, userData: Partial<User>): Promise<ApiResponse<User>> => {
    return apiRequest<User>(`/users/${userId}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  },

  deleteUser: async (userId: string): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`/users/${userId}`, {
      method: 'DELETE',
    });
  },
};

// Schedule management API
export const scheduleApi = {
  getUserSchedule: async (userId: string, weekStart?: string): Promise<ApiResponse<Schedule>> => {
    const params = weekStart ? `?weekStart=${weekStart}` : '';
    return apiRequest<Schedule>(`/schedules/user/${userId}${params}`);
  },

  createShift: async (shiftData: Partial<Shift>): Promise<ApiResponse<Shift>> => {
    return apiRequest<Shift>('/shifts', {
      method: 'POST',
      body: JSON.stringify(shiftData),
    });
  },

  updateShift: async (shiftId: string, shiftData: Partial<Shift>): Promise<ApiResponse<Shift>> => {
    return apiRequest<Shift>(`/shifts/${shiftId}`, {
      method: 'PUT',
      body: JSON.stringify(shiftData),
    });
  },

  deleteShift: async (shiftId: string): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`/shifts/${shiftId}`, {
      method: 'DELETE',
    });
  },
};

// Swap request API
export const swapApi = {
  getSwapRequests: async (userId?: string): Promise<ApiResponse<SwapRequest[]>> => {
    const params = userId ? `?userId=${userId}` : '';
    return apiRequest<SwapRequest[]>(`/swaps${params}`);
  },

  createSwapRequest: async (swapData: Partial<SwapRequest>): Promise<ApiResponse<SwapRequest>> => {
    return apiRequest<SwapRequest>('/swaps', {
      method: 'POST',
      body: JSON.stringify(swapData),
    });
  },

  respondToSwapRequest: async (
    swapId: string, 
    action: 'accept' | 'reject'
  ): Promise<ApiResponse<SwapRequest>> => {
    return apiRequest<SwapRequest>(`/swaps/${swapId}/${action}`, {
      method: 'PUT',
    });
  },

  cancelSwapRequest: async (swapId: string): Promise<ApiResponse<null>> => {
    return apiRequest<null>(`/swaps/${swapId}`, {
      method: 'DELETE',
    });
  },
};

// Analytics API
export const analyticsApi = {
  getAnalytics: async (): Promise<ApiResponse<AnalyticsData>> => {
    return apiRequest<AnalyticsData>('/analytics');
  },

  getUserAnalytics: async (userId: string): Promise<ApiResponse<Partial<AnalyticsData>>> => {
    return apiRequest<Partial<AnalyticsData>>(`/analytics/user/${userId}`);
  },
};
