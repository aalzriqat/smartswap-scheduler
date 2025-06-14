
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
  role: 'Employee' | 'Manager' | 'WorkFlowManagement' | 'Developer';
  skills: string[];
  marketplace: string;
  userLogin?: string; // Added optional userLogin property
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

// Smart Swap Intent types
export interface SwapIntent {
  _id: string;
  userId: string;
  originalShiftId: string;
  preferredTimeSlots: ('morning' | 'day' | 'evening' | 'any')[];
  preferredMarketplaces: string[];
  skillFlexibility: boolean;
  maxDaysOut: number;
  status: 'active' | 'matched' | 'expired' | 'cancelled';
  priority: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

export interface UserPreferences {
  _id: string;
  userId: string;
  autoMatchEnabled: boolean;
  preferredTimeSlots: ('morning' | 'day' | 'evening' | 'any')[];
  preferredMarketplaces: string[];
  skillFlexibility: boolean;
  maxSwapsPerWeek: number;
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  blacklistedUsers: string[];
  createdAt: string;
  updatedAt: string;
}

export interface SmartMatch {
  _id: string; // Added missing _id property
  id: string;
  requesterIntentId: string;
  targetIntentId: string;
  matchScore: number;
  compatibility: 'Perfect Match' | 'High Match' | 'Good Match' | 'Fair Match';
  factors: MatchFactor[];
  reason: string;
  status: 'pending' | 'accepted' | 'rejected'; // Added status property
  calculatedAt: string;
  expiresAt: string;
}

export interface MatchFactor {
  factor: string;
  status: 'positive' | 'negative' | 'neutral';
  description: string;
  weight: number;
}

export interface SmartMatchResult {
  intentId: string;
  matches: SmartMatch[];
  totalMatches: number;
  searchedAt: string;
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

// Dashboard types
export interface DashboardStats {
  activeRequests: number;
  successfulMatches: number;
  aiConfidence: number;
  trends: {
    activeRequestsChange: number;
    successfulMatchesChange: number;
    aiConfidenceChange: number;
  };
}

// Multi-hop Swap Chain Types
export type ChainStatus = 'proposed' | 'pending' | 'approved' | 'executing' | 'executed' | 'failed' | 'expired';
export type ApprovalStatus = 'pending' | 'approved' | 'rejected';

export interface SwapChain {
  _id: string;
  chainId: string;
  participants: ChainParticipant[];
  swapSteps: SwapStep[];
  status: ChainStatus;
  chainScore: number;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  approvals: ChainApproval[];
  executionOrder: number[];
  initiatorUserId: string;
  notes?: string;
}

export interface ChainParticipant {
  userId: string;
  originalShiftId: string;
  desiredShiftId: string;
  approvalStatus: ApprovalStatus;
  approvedAt?: string;
  rejectedAt?: string;
  rejectionReason?: string;
}

export interface SwapStep {
  stepId: string;
  fromUserId: string;
  toUserId: string;
  shiftId: string;
  stepOrder: number;
  businessRuleValidation: {
    isValid: boolean;
    violations: string[];
    warnings: string[];
  };
  executed: boolean;
  executedAt?: string;
}

export interface ChainApproval {
  userId: string;
  status: ApprovalStatus;
  approvedAt?: string;
  rejectedAt?: string;
  reason?: string;
}

export interface ChainDetectionOptions {
  maxChainLength: number;
  minChainScore: number;
  includePartialMatches: boolean;
  timeWindowDays: number;
}

export interface ChainExecutionResult {
  success: boolean;
  executedSteps: SwapStep[];
  failedStep?: SwapStep;
  rollbackRequired: boolean;
  error?: string;
}

export interface MultiHopMatchResult {
  directMatches: SmartMatch[];
  multiHopChains: SwapChain[];
  totalOptions: number;
}
