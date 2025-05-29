import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapChainApi } from '@/services/api';
import { SwapChain, ChainDetectionOptions } from '@/types/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useSwapChains = (userId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const targetUserId = userId || user?._id;

  // Get user's swap chains
  const { data: userChains, isLoading: isLoadingUserChains } = useQuery({
    queryKey: ['swapChains', 'user', targetUserId],
    queryFn: async () => {
      if (!targetUserId) return [];
      const response = await swapChainApi.getUserSwapChains(targetUserId);
      return response.success ? response.data.chains : [];
    },
    enabled: !!targetUserId,
  });

  // Get active chains (for admin/management view)
  const { data: activeChains, isLoading: isLoadingActiveChains } = useQuery({
    queryKey: ['swapChains', 'active'],
    queryFn: async () => {
      const response = await swapChainApi.getActiveSwapChains();
      return response.success ? response.data.chains : [];
    },
  });

  // Detect swap chains mutation
  const detectChainsMutation = useMutation({
    mutationFn: ({ intentId, options }: { intentId: string; options?: Partial<ChainDetectionOptions> }) =>
      swapChainApi.detectSwapChains(intentId, options),
    onSuccess: (response) => {
      if (response.success) {
        const { totalFound, saved } = response.data;
        toast({
          title: 'Chain detection complete',
          description: `Found ${totalFound} potential chains, ${saved} saved for review.`,
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['swapChains'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Chain detection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Approve chain participation mutation
  const approveChainMutation = useMutation({
    mutationFn: ({ chainId, reason }: { chainId: string; reason?: string }) =>
      swapChainApi.approveChainParticipation(chainId, reason),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Chain approved',
          description: 'You have successfully approved participation in this swap chain.',
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['swapChains'] });
        queryClient.invalidateQueries({ queryKey: ['swapChain'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Approval failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Reject chain participation mutation
  const rejectChainMutation = useMutation({
    mutationFn: ({ chainId, reason }: { chainId: string; reason: string }) =>
      swapChainApi.rejectChainParticipation(chainId, reason),
    onSuccess: (response) => {
      if (response.success) {
        toast({
          title: 'Chain rejected',
          description: 'You have rejected participation in this swap chain.',
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['swapChains'] });
        queryClient.invalidateQueries({ queryKey: ['swapChain'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Rejection failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Execute chain mutation
  const executeChainMutation = useMutation({
    mutationFn: (chainId: string) => swapChainApi.executeSwapChain(chainId),
    onSuccess: (response) => {
      if (response.success) {
        const { executedSteps, totalSteps } = response.data;
        toast({
          title: 'Chain execution started',
          description: `Executing ${totalSteps} swap steps. Progress: ${executedSteps}/${totalSteps}`,
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['swapChains'] });
        queryClient.invalidateQueries({ queryKey: ['swapChain'] });
        queryClient.invalidateQueries({ queryKey: ['swapIntents'] });
      }
    },
    onError: (error: Error) => {
      toast({
        title: 'Chain execution failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    // Data
    userChains: userChains || [],
    activeChains: activeChains || [],

    // Loading states
    isLoadingUserChains,
    isLoadingActiveChains,

    // Mutations
    detectChains: detectChainsMutation.mutate,
    approveChain: approveChainMutation.mutate,
    rejectChain: rejectChainMutation.mutate,
    executeChain: executeChainMutation.mutate,

    // Mutation states
    isDetecting: detectChainsMutation.isPending,
    isApproving: approveChainMutation.isPending,
    isRejecting: rejectChainMutation.isPending,
    isExecuting: executeChainMutation.isPending,
  };
};

export const useSwapChain = (chainId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get specific chain details
  const { data: chain, isLoading, refetch } = useQuery({
    queryKey: ['swapChain', chainId],
    queryFn: async () => {
      if (!chainId) return null;
      const response = await swapChainApi.getSwapChain(chainId);
      return response.success ? response.data : null;
    },
    enabled: !!chainId,
  });

  // Get chain execution status
  const { data: executionStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['swapChain', chainId, 'status'],
    queryFn: async () => {
      if (!chainId) return null;
      const response = await swapChainApi.getChainExecutionStatus(chainId);
      return response.success ? response.data : null;
    },
    enabled: !!chainId,
    refetchInterval: (data) => {
      // Refetch every 2 seconds if chain is executing
      return data?.status === 'executing' ? 2000 : false;
    },
  });

  return {
    // Data
    chain,
    executionStatus,

    // Loading states
    isLoading,
    isLoadingStatus,

    // Actions
    refetch,
  };
};

export const useChainApprovals = () => {
  const { user } = useAuth();
  const { userChains } = useSwapChains();

  // Get chains pending user's approval
  const pendingApprovals = userChains.filter(chain => {
    const userParticipant = chain.participants.find(p => p.userId === user?._id);
    return userParticipant?.approvalStatus === 'pending' && chain.status === 'proposed';
  });

  // Get chains user has approved
  const approvedChains = userChains.filter(chain => {
    const userParticipant = chain.participants.find(p => p.userId === user?._id);
    return userParticipant?.approvalStatus === 'approved';
  });

  // Get chains user has rejected
  const rejectedChains = userChains.filter(chain => {
    const userParticipant = chain.participants.find(p => p.userId === user?._id);
    return userParticipant?.approvalStatus === 'rejected';
  });

  return {
    pendingApprovals,
    approvedChains,
    rejectedChains,
    totalPending: pendingApprovals.length,
  };
};
