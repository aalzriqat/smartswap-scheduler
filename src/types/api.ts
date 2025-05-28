
// Base API response structure
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// User and authentication types
export interface User {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'Employee' | 'Manager' | 'Admin' | 'Developer';
  skills: string[];
  marketplace: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

// Schedule and shift types
export interface Shift {
  _id: string;
  userId: string;
  date: string;
  startTime: string;
  endTime: string;
  type: 'Day Shift' | 'Evening Shift' | 'Morning Shift';
  skills: string[];
  marketplace: string;
  status: 'confirmed' | 'pending' | 'swap-requested' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface Schedule {
  _id: string;
  userId: string;
  weekStart: string;
  shifts: Shift[];
  totalHours: number;
  createdAt: string;
  updatedAt: string;
}

// Swap request types
export interface SwapRequest {
  _id: string;
  requesterId: string;
  requesterShiftId: string;
  targetUserId?: string;
  targetShiftId?: string;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

// Analytics types
export interface AnalyticsData {
  swapTrends: Array<{
    month: string;
    swaps: number;
    success: number;
  }>;
  skillDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  marketplaceData: Array<{
    marketplace: string;
    employees: number;
    utilization: number;
  }>;
  systemMetrics: {
    activeUsers: number;
    swapSuccessRate: number;
    avgMatchTime: number;
    systemEfficiency: number;
  };
}
