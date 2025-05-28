
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapApi } from '@/services/api';
import { SwapRequest } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSwaps = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get swap requests
  const { data: swapRequests, isLoading } = useQuery({
    queryKey: ['swaps', userId],
    queryFn: async () => {
      const response = await swapApi.getSwapRequests(userId);
      return response.data;
    },
  });

  // Create swap request mutation
  const createSwapMutation = useMutation({
    mutationFn: (swapData: Partial<SwapRequest>) => swapApi.createSwapRequest(swapData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      toast({
        title: 'Swap request created',
        description: 'Your swap request has been submitted.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create swap request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Respond to swap request mutation
  const respondToSwapMutation = useMutation({
    mutationFn: ({ swapId, action }: { swapId: string; action: 'accept' | 'reject' }) =>
      swapApi.respondToSwapRequest(swapId, action),
    onSuccess: (_, { action }) => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      toast({
        title: `Swap request ${action}ed`,
        description: `You have ${action}ed the swap request.`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to respond to swap request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Cancel swap request mutation
  const cancelSwapMutation = useMutation({
    mutationFn: (swapId: string) => swapApi.cancelSwapRequest(swapId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['swaps'] });
      toast({
        title: 'Swap request cancelled',
        description: 'Your swap request has been cancelled.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to cancel swap request',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    swapRequests,
    isLoading,
    createSwap: createSwapMutation.mutate,
    respondToSwap: respondToSwapMutation.mutate,
    cancelSwap: cancelSwapMutation.mutate,
    isCreating: createSwapMutation.isPending,
    isResponding: respondToSwapMutation.isPending,
    isCancelling: cancelSwapMutation.isPending,
  };
};
