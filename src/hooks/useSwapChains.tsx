import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { swapChainApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { SwapChain } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

const MANAGER_ROLES = ['WorkFlowManagement', 'Developer', 'Manager'];

export const useSwapChains = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get the current user's swap chains
  const {
    data: userChains = [],
    isLoading: isLoadingUserChains,
    error: userChainsError,
  } = useQuery({
    queryKey: ['userChains', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      const res = await swapChainApi.getUserSwapChains(userProfile.id);
      return (res.data?.chains || []) as SwapChain[];
    },
    enabled: !!userProfile?.id,
  });

  // Get active swap chains (for managers/admins)
  const isManagerRole = !!user?.role && MANAGER_ROLES.includes(user.role);
  const {
    data: activeChains = [],
    isLoading: isLoadingActiveChains,
    error: activeChainsError,
  } = useQuery({
    queryKey: ['activeChains'],
    queryFn: async () => {
      const res = await swapChainApi.getActiveSwapChains();
      return (res.data?.chains || []) as SwapChain[];
    },
    enabled: isManagerRole,
  });

  const [executionStatus, setExecutionStatus] = useState<{
    chainId: string;
    executedSteps: number;
    totalSteps: number;
    lastExecutedAt?: string;
  } | null>(null);

  const { mutate: executeChain, isLoading: isExecuting } = useMutation({
    mutationFn: async (chainId: string) => {
      const res = await swapChainApi.executeSwapChain(chainId);
      setExecutionStatus({
        chainId,
        executedSteps: res.data?.executedSteps ?? 0,
        totalSteps: res.data?.totalSteps ?? 0,
        lastExecutedAt: new Date().toISOString(),
      });
      toast({ title: 'Chain executed', description: `Successfully executed chain ${chainId}` });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userChains', userProfile?.id]);
      queryClient.invalidateQueries(['activeChains']);
    },
    onError: (error: any) => {
      toast({ title: 'Chain execution failed', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
    onSettled: () => setExecutionStatus(null),
  });

  const { mutate: detectChains, isLoading: isDetecting } = useMutation({
    mutationFn: async ({ intentId, options }: { intentId: string; options?: any }) => {
      const res = await swapChainApi.detectSwapChains(intentId, options);
      return res.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['userChains', userProfile?.id]);
      toast({ title: 'Chain detection complete', description: `Found ${data?.totalFound ?? 0} possible chain(s).` });
    },
    onError: (error: any) => {
      toast({ title: 'Chain detection failed', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  const { mutate: approveChain, isLoading: isApproving } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason?: string }) => {
      const res = await swapChainApi.approveChainParticipation(chainId, reason);
      toast({ title: 'Chain approved', description: `You have approved chain ${chainId}` });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['userChains', userProfile?.id]),
    onError: (error: any) => {
      toast({ title: 'Chain approval failed', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  const { mutate: rejectChain, isLoading: isRejecting } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason: string }) => {
      const res = await swapChainApi.rejectChainParticipation(chainId, reason);
      toast({ title: 'Chain rejected', description: `You have rejected chain ${chainId}` });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['userChains', userProfile?.id]),
    onError: (error: any) => {
      toast({ title: 'Chain rejection failed', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  return {
    userChains,
    activeChains,
    isLoadingUserChains,
    isLoadingActiveChains,
    executeChain,
    isExecuting,
    executionStatus,
    detectChains,
    isDetecting,
    approveChain,
    rejectChain,
    isApproving,
    isRejecting,
  };
};

export const useChainApprovals = () => {
  const { userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { userChains } = useSwapChains();

  const pendingApprovals = userChains.filter(
    (chain) =>
      (chain.status === 'proposed' || chain.status === 'pending') &&
      chain.participants.some(
        (participant) => participant.userId === userProfile?.id && participant.approvalStatus === 'pending'
      )
  );

  const approvedChains = userChains.filter(
    (chain) =>
      chain.status !== 'proposed' && chain.status !== 'pending' &&
      chain.participants.some(
        (participant) => participant.userId === userProfile?.id && participant.approvalStatus === 'approved'
      )
  );

  const rejectedChains = userChains.filter(
    (chain) =>
      chain.status !== 'proposed' && chain.status !== 'pending' &&
      chain.participants.some(
        (participant) => participant.userId === userProfile?.id && participant.approvalStatus === 'rejected'
      )
  );

  const totalPending = pendingApprovals.length;

  const { mutate: approveChain, isLoading: isApproving } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason?: string }) => {
      const res = await swapChainApi.approveChainParticipation(chainId, reason);
      toast({ title: 'Chain approved', description: `You have approved chain ${chainId}` });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['userChains', userProfile?.id]),
    onError: (error: any) => {
      toast({ title: 'Chain approval failed', description: error.message || 'An error occurred.', variant: 'destructive' });
    },
  });

  const { mutate: rejectChain, isLoading: isRejecting } = useMutation({
    mutationFn: async ({ chainId, reason }: { chainId: string; reason: string }) => {
      const res = await swapChainApi.rejectChainParticipation(chainId, reason);
      toast({ title: 'Chain rejected', description: `You have rejected chain ${chainId}` });
      return res.data;
    },
    onSuccess: () => queryClient.invalidateQueries(['userChains', userProfile?.id]),
    onError: (error: any) => {
      toast({ title: 'Chain rejection failed', description: error.message || 'An error occurred.', variant: 'destructive' });
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
  const { userProfile } = useAuth();
  const { userChains, executionStatus } = useSwapChains();

  const chain = userChains.find((c) => c.chainId === chainId);
  const isLoading = !chain && !!userProfile?.id;

  return {
    chain,
    isLoading,
    executionStatus: executionStatus?.chainId === chainId ? executionStatus : null,
  };
};
