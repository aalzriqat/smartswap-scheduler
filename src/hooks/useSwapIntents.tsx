import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapIntentApi } from '@/services/api';
import { SwapIntent, SmartMatchResult, UserPreferences } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSwapIntents = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const targetUserId = userId || user?._id;

  // Get user's swap intents
  const { data: swapIntents, isLoading: isLoadingIntents } = useQuery({
    queryKey: ['swapIntents', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const response = await swapIntentApi.getUserSwapIntents(targetUserId);
      return response.success ? response.data : [];
    },
    enabled: !!targetUserId,
  });

  // Get active swap intents
  const { data: activeIntents, isLoading: isLoadingActive } = useQuery({
    queryKey: ['swapIntents', targetUserId, 'active'],
    queryFn: async () => {
      if (!targetUserId) return [];
      const response = await swapIntentApi.getUserSwapIntents(targetUserId, 'active');
      return response.success ? response.data : [];
    },
    enabled: !!targetUserId,
  });

  // Get all active intents (for browsing)
  const { data: allActiveIntents, isLoading: isLoadingAllActive } = useQuery({
    queryKey: ['swapIntents', 'all-active'],
    queryFn: async () => {
      const response = await swapIntentApi.getActiveSwapIntents();
      return response.success ? response.data : [];
    },
  });

  // Create swap intent mutation
  const createSwapIntentMutation = useMutation({
    mutationFn: (intentData: Partial<SwapIntent>) => swapIntentApi.createSwapIntent(intentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swapIntents'] });
      toast({
        title: 'Swap intent created',
        description: 'Your swap intent has been created successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create swap intent',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update swap intent mutation
  const updateSwapIntentMutation = useMutation({
    mutationFn: ({ intentId, updates }: { intentId: string; updates: Partial<SwapIntent> }) =>
      swapIntentApi.updateSwapIntent(intentId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swapIntents'] });
      toast({
        title: 'Swap intent updated',
        description: 'Your swap intent has been updated successfully.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update swap intent',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel swap intent mutation
  const cancelSwapIntentMutation = useMutation({
    mutationFn: (intentId: string) => swapIntentApi.cancelSwapIntent(intentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swapIntents'] });
      toast({
        title: 'Swap intent cancelled',
        description: 'Your swap intent has been cancelled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel swap intent',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    swapIntents: swapIntents || [],
    activeIntents: activeIntents || [],
    allActiveIntents: allActiveIntents || [],

    // Loading states
    isLoadingIntents,
    isLoadingActive,
    isLoadingAllActive,

    // Mutations
    createSwapIntent: createSwapIntentMutation.mutate,
    updateSwapIntent: updateSwapIntentMutation.mutate,
    cancelSwapIntent: cancelSwapIntentMutation.mutate,

    // Mutation states
    isCreating: createSwapIntentMutation.isPending,
    isUpdating: updateSwapIntentMutation.isPending,
    isCancelling: cancelSwapIntentMutation.isPending,
  };
};

export const useSmartMatches = (intentId?: string) => {
  const { toast } = useToast();

  // Get smart matches for an intent
  const { data: matchResult, isLoading, refetch } = useQuery({
    queryKey: ['smartMatches', intentId],
    queryFn: async () => {
      if (!intentId) return null;
      const response = await swapIntentApi.findSmartMatches(intentId);
      return response.success ? response.data : null;
    },
    enabled: !!intentId,
  });

  // Find matches mutation (for manual refresh)
  const findMatchesMutation = useMutation({
    mutationFn: (targetIntentId: string) => swapIntentApi.findSmartMatches(targetIntentId),
    onSuccess: (response) => {
      if (response.success) {
        const matchCount = response.data.matches.length;
        toast({
          title: 'Search complete',
          description: matchCount > 0
            ? `Found ${matchCount} potential matches.`
            : 'Found 0 potential matches.',
        });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Search failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    matches: matchResult?.matches || [],
    totalMatches: matchResult?.totalMatches || 0,
    searchedAt: matchResult?.searchedAt,

    // Loading state
    isLoading,

    // Actions
    refetch,
    findMatches: findMatchesMutation.mutate,

    // Mutation state
    isSearching: findMatchesMutation.isPending,
  };
};

export const useUserPreferences = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['userPreferences'],
    queryFn: async () => {
      const response = await swapIntentApi.getUserPreferences();
      return response.success ? response.data : null;
    },
  });

  // Update preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: (updates: Partial<UserPreferences>) =>
      swapIntentApi.updateUserPreferences(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userPreferences'] });
      toast({
        title: 'Preferences updated',
        description: 'Your matching preferences have been saved.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update preferences',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    preferences,

    // Loading state
    isLoading,

    // Actions
    updatePreferences: updatePreferencesMutation.mutate,

    // Mutation state
    isUpdating: updatePreferencesMutation.isPending,
  };
};
