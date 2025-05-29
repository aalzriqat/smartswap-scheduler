
// API Configuration
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    REFRESH: '/auth/refresh',
  },

  // Users
  USERS: {
    BASE: '/users',
    BY_ID: (id: string) => `/users/${id}`,
    UPDATE: (id: string) => `/users/${id}`,
    DELETE: (id: string) => `/users/${id}`,
  },

  // Schedules & Shifts
  SCHEDULES: {
    USER: (userId: string) => `/schedules/user/${userId}`,
  },
  SHIFTS: {
    BASE: '/shifts',
    BY_ID: (id: string) => `/shifts/${id}`,
    UPDATE: (id: string) => `/shifts/${id}`,
    DELETE: (id: string) => `/shifts/${id}`,
  },

  // Swap Requests
  SWAPS: {
    BASE: '/swaps',
    BY_ID: (id: string) => `/swaps/${id}`,
    ACCEPT: (id: string) => `/swaps/${id}/accept`,
    REJECT: (id: string) => `/swaps/${id}/reject`,
    CANCEL: (id: string) => `/swaps/${id}`,
  },

  // Smart Swap Intents
  SWAP_INTENTS: {
    BASE: '/swap-intents',
    ACTIVE: '/swap-intents/active',
    USER: (userId: string) => `/swap-intents/user/${userId}`,
    BY_ID: (id: string) => `/swap-intents/${id}`,
    MATCHES: (id: string) => `/swap-intents/${id}/matches`,
    PREFERENCES: '/swap-intents/preferences',
  },

  // Analytics
  ANALYTICS: {
    BASE: '/analytics',
    USER: (userId: string) => `/analytics/user/${userId}`,
  },
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;
