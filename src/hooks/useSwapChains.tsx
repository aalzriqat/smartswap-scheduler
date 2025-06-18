import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SwapChain } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSwapChains = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's swap chains
  const {
    data: userChains = [],
    isLoading: isLoadingUserChains,
    error: userChainsError
  } = useQuery({
    queryKey: ['userChains', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('swap_chains')
        .select('*')
        .contains('participants', [{ userId: userProfile.id }]);
      
      if (error) throw error;
      return data as SwapChain[];
    },
    enabled: !!userProfile?.id,
  });

  // Get active swap chains (for admin/managers)
  const {
    data: activeChains = [],
    isLoading: isLoadingActiveChains,
    error: activeChainsError
  } = useQuery({
    queryKey: ['activeChains'],
    queryFn: async () => {
      if (!user?.role || !['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role)) return [];
      
      const { data, error } = await supabase
        .from('swap_chains')
        .select('*')
        .in('status', ['proposed', 'pending', 'approved', 'executing'])
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SwapChain[];
    },
    enabled: !!user?.role && ['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role),
  });

  // Execute a swap chain
  const [executionStatus, setExecutionStatus] = useState<{
    chainId: string;
    executedSteps: number;
    totalSteps: number;
    lastExecutedAt?: string;
  } | null>(null);
  
  const { mutate: executeChain, isLoading: isExecuting } = useMutation({
    mutationFn: async (chainId: string) => {
      if (!userProfile?.id) throw new Error('User not authenticated');
      
      // Optimistically update the chain status
      queryClient.setQueryData(['userChains', userProfile.id], (old: SwapChain[] | undefined) => {
        return old?.map(chain => chain.chainId === chainId ? { ...chain, status: 'executing' } : chain);
      });

      // Simulate chain execution (replace with actual logic)
      const chainToExecute = userChains.find(chain => chain.chainId === chainId);
      if (!chainToExecute) throw new Error('Chain not found');

      const totalSteps = chainToExecute.swapSteps.length;
      let executedSteps = 0;
      let lastExecutedAt: string | undefined = undefined;

      setExecutionStatus({
        chainId: chainId,
        executedSteps: 0,
        totalSteps: totalSteps,
      });

      for (const step of chainToExecute.swapSteps) {
        // Simulate step execution delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        executedSteps++;
        lastExecutedAt = new Date().toISOString();

        setExecutionStatus(prev => {
          if (!prev) return { chainId: chainId, executedSteps: 1, totalSteps: totalSteps, lastExecutedAt: lastExecutedAt };
          return { ...prev, executedSteps: executedSteps, lastExecutedAt: lastExecutedAt };
        });
      }

      // Update chain status to 'executed'
      const { data, error } = await supabase
        .from('swap_chains')
        .update({ status: 'executed' })
        .eq('chain_id', chainId);
      
      if (error) throw error;

      toast({
        title: 'Chain executed',
        description: `Successfully executed chain ${chainId}`,
      });
      
      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch swap chains
      queryClient.invalidateQueries(['userChains', userProfile?.id]);
      queryClient.invalidateQueries(['activeChains']);
    },
    onError: (error: any) => {
      console.error('Chain execution error:', error);
      toast({
        title: 'Chain execution failed',
        description: error.message || 'An error occurred during chain execution',
        variant: 'destructive',
      });
    },
    onSettled: () => {
      setExecutionStatus(null);
    }
  });

  return {
    userChains,
    activeChains,
    isLoadingUserChains,
    isLoadingActiveChains,
    executeChain,
    isExecuting,
    executionStatus,
  };
};

export const useChainApprovals = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userChains } = useSwapChains();

  const pendingApprovals = userChains.filter(
    (chain) =>
      chain.status === 'proposed' || chain.status === 'pending' &&
      chain.participants.some(
        (participant) =>
          participant.userId === userProfile?.id && participant.approvalStatus === 'pending'
      )
  );

  const approvedChains = userChains.filter(
    (chain) =>
      chain.status !== 'proposed' && chain.status !== 'pending' &&
      chain.participants.some(
        (participant) =>
          participant.userId === userProfile?.id && participant.approvalStatus === 'approved'
      )
  );

  const rejectedChains = userChains.filter(
    (chain) =>
      chain.status !== 'proposed' && chain.status !== 'pending' &&
      chain.participants.some(
        (participant) =>
          participant.userId === userProfile?.id && participant.approvalStatus === 'rejected'
      )
  );

  const totalPending = pendingApprovals.length;

  const { mutate: approveChain, isLoading: isApproving } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason?: string }) => {
      if (!userProfile?.id) throw new Error('User not authenticated');

      // Optimistically update the approval status
      queryClient.setQueryData(['userChains', userProfile.id], (old: SwapChain[] | undefined) => {
        return old?.map(chain => {
          if (chain.chainId === chainId) {
            return {
              ...chain,
              participants: chain.participants.map(participant => {
                if (participant.userId === userProfile.id) {
                  return { ...participant, approvalStatus: 'approved', approvedAt: new Date().toISOString() };
                }
                return participant;
              })
            };
          }
          return chain;
        });
      });

      // Update approval status in the database
      const { data, error } = await supabase
        .from('swap_chains')
        .update({
          participants: userChains.find(chain => chain.chainId === chainId)?.participants.map(participant => {
            if (participant.userId === userProfile.id) {
              return { ...participant, approvalStatus: 'approved', approvedAt: new Date().toISOString() };
            }
            return participant;
          })
        })
        .eq('chain_id', chainId);

      if (error) throw error;

      toast({
        title: 'Chain approved',
        description: `You have approved chain ${chainId}`,
      });

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch swap chains
      queryClient.invalidateQueries(['userChains', userProfile?.id]);
    },
    onError: (error: any) => {
      console.error('Chain approval error:', error);
      toast({
        title: 'Chain approval failed',
        description: error.message || 'An error occurred during chain approval',
        variant: 'destructive',
      });
    },
  });

  const { mutate: rejectChain, isLoading: isRejecting } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason: string }) => {
      if (!userProfile?.id) throw new Error('User not authenticated');

      // Optimistically update the approval status
      queryClient.setQueryData(['userChains', userProfile.id], (old: SwapChain[] | undefined) => {
        return old?.map(chain => {
          if (chain.chainId === chainId) {
            return {
              ...chain,
              participants: chain.participants.map(participant => {
                if (participant.userId === userProfile.id) {
                  return { ...participant, approvalStatus: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason };
                }
                return participant;
              })
            };
          }
          return chain;
        });
      });

      // Update approval status in the database
      const { data, error } = await supabase
        .from('swap_chains')
        .update({
          participants: userChains.find(chain => chain.chainId === chainId)?.participants.map(participant => {
            if (participant.userId === userProfile.id) {
              return { ...participant, approvalStatus: 'rejected', rejectedAt: new Date().toISOString(), rejectionReason: reason };
            }
            return participant;
          })
        })
        .eq('chain_id', chainId);

      if (error) throw error;

      toast({
        title: 'Chain rejected',
        description: `You have rejected chain ${chainId}`,
      });

      return data;
    },
    onSuccess: () => {
      // Invalidate and refetch swap chains
      queryClient.invalidateQueries(['userChains', userProfile?.id]);
    },
    onError: (error: any) => {
      console.error('Chain rejection error:', error);
      toast({
        title: 'Chain rejection failed',
        description: error.message || 'An error occurred during chain rejection',
        variant: 'destructive',
      });
    },
  });

  return {
    pendingApprovals,
    approvedChains,
    rejectedChains,
    totalPending,
    approveChain,
    rejectChain,
    isApproving,
    isRejecting,
  };
};

export const useSwapChain = (chainId: string) => {
  const { user, userProfile } = useAuth();
  const { userChains, executionStatus } = useSwapChains();

  const chain = userChains.find((chain) => chain.chainId === chainId);
  const isLoading = !chain && !!userProfile?.id;

  return {
    chain,
    isLoading,
    executionStatus: executionStatus?.chainId === chainId ? executionStatus : null,
  };
};
