
// API Configuration for Supabase
export const API_CONFIG = {
  BASE_URL: 'https://xumzfrtoyfqnotncedih.supabase.co/rest/v1',
  TIMEOUT: 10000, // 10 seconds
  RETRY_ATTEMPTS: 3,
};

// Supabase Configuration
export const SUPABASE_CONFIG = {
  URL: 'https://xumzfrtoyfqnotncedih.supabase.co',
  ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh1bXpmcnRveWZxbm90bmNlZGloIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MDI1ODQsImV4cCI6MjA2NTQ3ODU4NH0.XMZ7heoPhUGVKwurHdOhfv-OQaHCWWI4z-OMGyqKukM',
};

// API Endpoints for direct Supabase REST API usage
export const API_ENDPOINTS = {
  // Profiles
  PROFILES: {
    BASE: '/profiles',
    BY_ID: (id: string) => `/profiles?id=eq.${id}`,
  },

  // Schedules & Shifts
  SCHEDULES: {
    BASE: '/schedules',
    BY_USER: (userId: string) => `/schedules?user_id=eq.${userId}`,
  },
  SHIFTS: {
    BASE: '/shifts',
    BY_USER: (userId: string) => `/shifts?user_id=eq.${userId}`,
    BY_ID: (id: string) => `/shifts?id=eq.${id}`,
  },

  // Swap Requests
  SWAP_REQUESTS: {
    BASE: '/swap_requests',
    BY_USER: (userId: string) => `/swap_requests?or=(requester_id.eq.${userId},target_user_id.eq.${userId})`,
  },

  // Swap Intents
  SWAP_INTENTS: {
    BASE: '/swap_intents',
    ACTIVE: '/swap_intents?status=eq.active',
    BY_USER: (userId: string) => `/swap_intents?user_id=eq.${userId}`,
  },

  // User Preferences
  USER_PREFERENCES: {
    BASE: '/user_preferences',
    BY_USER: (userId: string) => `/user_preferences?user_id=eq.${userId}`,
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
