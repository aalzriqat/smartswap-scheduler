
import { ApiResponse, User, AuthResponse, Schedule, Shift, SwapRequest, AnalyticsData, DashboardStats, SwapIntent, SmartMatchResult, UserPreferences, SwapChain, ChainDetectionOptions } from '@/types/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';

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

// Smart Swap Intent API
export const swapIntentApi = {
  getUserSwapIntents: async (userId: string, status?: string): Promise<ApiResponse<SwapIntent[]>> => {
    const params = status ? `?status=${status}` : '';
    return apiRequest<SwapIntent[]>(`/swap-intents/user/${userId}${params}`);
  },

  createSwapIntent: async (intentData: Partial<SwapIntent>): Promise<ApiResponse<SwapIntent>> => {
    return apiRequest<SwapIntent>('/swap-intents', {
      method: 'POST',
      body: JSON.stringify(intentData),
    });
  },

  updateSwapIntent: async (intentId: string, updates: Partial<SwapIntent>): Promise<ApiResponse<SwapIntent>> => {
    return apiRequest<SwapIntent>(`/swap-intents/${intentId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  cancelSwapIntent: async (intentId: string): Promise<ApiResponse<SwapIntent>> => {
    return apiRequest<SwapIntent>(`/swap-intents/${intentId}`, {
      method: 'DELETE',
    });
  },

  findSmartMatches: async (intentId: string): Promise<ApiResponse<SmartMatchResult>> => {
    return apiRequest<SmartMatchResult>(`/swap-intents/${intentId}/matches`);
  },

  getActiveSwapIntents: async (filters?: {
    marketplace?: string;
    timeSlot?: string;
    skillFlexibility?: boolean;
  }): Promise<ApiResponse<SwapIntent[]>> => {
    const params = new URLSearchParams();
    if (filters?.marketplace) params.append('marketplace', filters.marketplace);
    if (filters?.timeSlot) params.append('timeSlot', filters.timeSlot);
    if (filters?.skillFlexibility !== undefined) params.append('skillFlexibility', filters.skillFlexibility.toString());

    const queryString = params.toString();
    return apiRequest<SwapIntent[]>(`/swap-intents/active${queryString ? `?${queryString}` : ''}`);
  },

  getUserPreferences: async (): Promise<ApiResponse<UserPreferences>> => {
    return apiRequest<UserPreferences>('/swap-intents/preferences');
  },

  updateUserPreferences: async (preferences: Partial<UserPreferences>): Promise<ApiResponse<UserPreferences>> => {
    return apiRequest<UserPreferences>('/swap-intents/preferences', {
      method: 'PUT',
      body: JSON.stringify(preferences),
    });
  },
};

// Multi-hop Swap Chain API
export const swapChainApi = {
  detectSwapChains: async (intentId: string, options?: Partial<ChainDetectionOptions>): Promise<ApiResponse<{ chains: SwapChain[]; totalFound: number; saved: number }>> => {
    return apiRequest<{ chains: SwapChain[]; totalFound: number; saved: number }>(`/swap-chains/detect/${intentId}`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  },

  getUserSwapChains: async (userId: string, status?: string, limit = 20, page = 1): Promise<ApiResponse<{ chains: SwapChain[]; pagination: any }>> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const queryString = params.toString();
    return apiRequest<{ chains: SwapChain[]; pagination: any }>(`/swap-chains/user/${userId}${queryString ? `?${queryString}` : ''}`);
  },

  getSwapChain: async (chainId: string): Promise<ApiResponse<SwapChain>> => {
    return apiRequest<SwapChain>(`/swap-chains/${chainId}`);
  },

  approveChainParticipation: async (chainId: string, reason?: string): Promise<ApiResponse<SwapChain>> => {
    return apiRequest<SwapChain>(`/swap-chains/${chainId}/approve`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  rejectChainParticipation: async (chainId: string, reason: string): Promise<ApiResponse<SwapChain>> => {
    return apiRequest<SwapChain>(`/swap-chains/${chainId}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  executeSwapChain: async (chainId: string): Promise<ApiResponse<{ chainId: string; executedSteps: number; totalSteps: number }>> => {
    return apiRequest<{ chainId: string; executedSteps: number; totalSteps: number }>(`/swap-chains/${chainId}/execute`, {
      method: 'POST',
    });
  },

  getChainExecutionStatus: async (chainId: string): Promise<ApiResponse<{ status: string; executedSteps: number; totalSteps: number; lastExecutedAt?: string }>> => {
    return apiRequest<{ status: string; executedSteps: number; totalSteps: number; lastExecutedAt?: string }>(`/swap-chains/${chainId}/status`);
  },

  getActiveSwapChains: async (limit = 50, page = 1): Promise<ApiResponse<{ chains: SwapChain[]; pagination: any }>> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    params.append('page', page.toString());

    const queryString = params.toString();
    return apiRequest<{ chains: SwapChain[]; pagination: any }>(`/swap-chains/active${queryString ? `?${queryString}` : ''}`);
  },
};

// Real Schedule API
export const realScheduleApi = {
  getAllSchedules: async (params?: { limit?: number; skill?: string; userLogin?: string }): Promise<ApiResponse<any[]>> => {
    const queryParams = new URLSearchParams();
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.skill) queryParams.append('skill', params.skill);
    if (params?.userLogin) queryParams.append('userLogin', params.userLogin);

    const queryString = queryParams.toString();
    return apiRequest<any[]>(`/real-schedules${queryString ? `?${queryString}` : ''}`);
  },

  getMySchedule: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/real-schedules/my-schedule');
  },

  getMyShifts: async (): Promise<ApiResponse<Shift[]>> => {
    return apiRequest<Shift[]>('/real-schedules/my-shifts');
  },

  getScheduleByUserLogin: async (userLogin: string): Promise<ApiResponse<any>> => {
    return apiRequest<any>(`/real-schedules/user/${userLogin}`);
  },

  getAvailableSkills: async (): Promise<ApiResponse<string[]>> => {
    return apiRequest<string[]>('/real-schedules/skills');
  },

  getScheduleStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/real-schedules/stats');
  },

  findSwapMatches: async (userLogin: string): Promise<ApiResponse<any[]>> => {
    return apiRequest<any[]>(`/real-schedules/user/${userLogin}/matches`);
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

// Dashboard API
export const dashboardApi = {
  getStats: async (): Promise<ApiResponse<DashboardStats>> => {
    return apiRequest<DashboardStats>('/dashboard/stats');
  },

  getDetailedStats: async (): Promise<ApiResponse<any>> => {
    return apiRequest<any>('/dashboard/detailed');
  },
};
