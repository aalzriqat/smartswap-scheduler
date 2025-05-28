
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';

export const useAnalytics = (userId?: string) => {
  // Get general analytics
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsApi.getAnalytics();
      return response.data;
    },
  });

  // Get user-specific analytics
  const { data: userAnalytics, isLoading: isLoadingUserAnalytics } = useQuery({
    queryKey: ['analytics', 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await analyticsApi.getUserAnalytics(userId);
      return response.data;
    },
    enabled: !!userId,
  });

  return {
    analytics,
    userAnalytics,
    isLoading,
    isLoadingUserAnalytics,
  };
};
