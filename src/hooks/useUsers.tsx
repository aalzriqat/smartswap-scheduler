import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userApi } from '@/services/api';
import { User } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useUsers = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get all users
  const { data: users, isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await userApi.getUsers();
      return response.data;
    },
    retry: 1,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user by ID
  const getUserById = (userId: string) => {
    return useQuery({
      queryKey: ['user', userId],
      queryFn: async () => {
        const response = await userApi.getUserById(userId);
        return response.data;
      },
      enabled: !!userId,
    });
  };

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, userData }: { userId: string; userData: Partial<User> }) =>
      userApi.updateUser(userId, userData),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user', response.data._id] });
      toast({
        title: 'User updated',
        description: 'User information has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Update failed',
        description: error.message || 'Failed to update user information.',
        variant: 'destructive',
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => userApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      toast({
        title: 'User deleted',
        description: 'User has been successfully removed.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Delete failed',
        description: error.message || 'Failed to delete user.',
        variant: 'destructive',
      });
    },
  });

  // Helper functions
  const getActiveUsers = () => {
    if (!users) return [];
    return users.filter(user => {
      // Consider users active if they've been updated in the last 30 days
      const lastUpdate = new Date(user.updatedAt);
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      return lastUpdate >= thirtyDaysAgo;
    });
  };

  const getUsersByRole = (role: string) => {
    if (!users) return [];
    return users.filter(user => user.role === role);
  };

  const getUsersByMarketplace = (marketplace: string) => {
    if (!users) return [];
    return users.filter(user => user.marketplace === marketplace);
  };

  const getUserStats = () => {
    if (!users) return null;
    
    const totalUsers = users.length;
    const activeUsers = getActiveUsers().length;
    const roleDistribution = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const marketplaceDistribution = users.reduce((acc, user) => {
      acc[user.marketplace] = (acc[user.marketplace] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalUsers,
      activeUsers,
      roleDistribution,
      marketplaceDistribution,
    };
  };

  return {
    // Data
    users: users || [],
    isLoading,
    error,
    
    // Helper functions
    getUserById,
    getActiveUsers: getActiveUsers(),
    getUsersByRole,
    getUsersByMarketplace,
    getUserStats: getUserStats(),
    
    // Mutations
    updateUser: updateUserMutation.mutate,
    deleteUser: deleteUserMutation.mutate,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  };
};
