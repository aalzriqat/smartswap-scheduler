import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapIntentApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { SwapIntent, UserPreferences } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSwapIntents = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: swapIntents = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['swapIntents', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const res = await swapIntentApi.getUserSwapIntents(userProfile.id);
      return (res.data || []) as SwapIntent[];
    },
    enabled: !!userProfile?.id,
  });

  const createSwapIntentMutation = useMutation({
    mutationFn: async (newIntent: Partial<SwapIntent>) => {
      const res = await swapIntentApi.createSwapIntent(newIntent);
      return res.data as SwapIntent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({ title: 'Swap intent created', description: 'Your swap intent has been successfully created.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error creating swap intent', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  const updateSwapIntentMutation = useMutation({
    mutationFn: async (updatedIntent: SwapIntent) => {
      const res = await swapIntentApi.updateSwapIntent(updatedIntent._id, updatedIntent);
      return res.data as SwapIntent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({ title: 'Swap intent updated', description: 'Your swap intent has been successfully updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating swap intent', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  const deleteSwapIntentMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await swapIntentApi.cancelSwapIntent(id);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({ title: 'Swap intent deleted', description: 'Your swap intent has been successfully deleted.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error deleting swap intent', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  return {
    swapIntents,
    // Aliases consumed by SmartMatchView / other views.
    activeIntents: swapIntents.filter((i) => i.status === 'active'),
    isLoadingActive: isLoading,
    isLoading,
    error,
    createSwapIntent: createSwapIntentMutation.mutateAsync,
    updateSwapIntent: updateSwapIntentMutation.mutateAsync,
    deleteSwapIntent: deleteSwapIntentMutation.mutateAsync,
    isCreating: createSwapIntentMutation.isLoading,
    isUpdating: updateSwapIntentMutation.isLoading,
    isDeleting: deleteSwapIntentMutation.isLoading,
  };
};

export const useUserPreferences = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: preferences = null,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['userPreferences', userProfile?.id],
    queryFn: async () => {
      const res = await swapIntentApi.getUserPreferences();
      return (res.data || null) as UserPreferences | null;
    },
    enabled: !!userProfile?.id,
  });

  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences: Partial<UserPreferences>) => {
      const res = await swapIntentApi.updateUserPreferences(updatedPreferences);
      return res.data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPreferences', userProfile?.id]);
      toast({ title: 'User preferences updated', description: 'Your user preferences have been successfully updated.' });
    },
    onError: (error: any) => {
      toast({ title: 'Error updating user preferences', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  return {
    preferences,
    isLoading,
    error,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdating: updatePreferencesMutation.isLoading,
  };
};

// Smart matches for a given swap intent — powered by the backend matching engine.
export const useSmartMatches = (intentId?: string | null) => {
  const {
    data,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ['smartMatches', intentId],
    queryFn: async () => {
      if (!intentId) return { matches: [] };
      const res = await swapIntentApi.findSmartMatches(intentId);
      return res.data;
    },
    enabled: !!intentId,
  });

  return {
    matches: (data?.matches || []) as any[],
    isLoading,
    isSearching: isFetching,
    findMatches: () => refetch(),
  };
};
