import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/services/api';
import { DashboardStats } from '@/types/api';

export const useDashboardStats = () => {
  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch
  } = useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getStats();
      return response.data;
    },
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 15000, // Consider data stale after 15 seconds
  });

  return {
    dashboardStats,
    isLoading,
    error,
    refetch
  };
};

export const useDetailedStats = () => {
  const {
    data: detailedStats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['detailed-stats'],
    queryFn: async () => {
      const response = await dashboardApi.getDetailedStats();
      return response.data;
    },
    refetchInterval: 60000, // Refetch every minute
    staleTime: 30000, // Consider data stale after 30 seconds
  });

  return {
    detailedStats,
    isLoading,
    error,
    refetch
  };
};
