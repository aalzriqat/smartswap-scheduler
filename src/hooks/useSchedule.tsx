
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/services/api';
import { Shift } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSchedule = (userId: string, weekStart?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user schedule
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', userId, weekStart],
    queryFn: async () => {
      const response = await scheduleApi.getUserSchedule(userId, weekStart);
      return response.data;
    },
    enabled: !!userId,
  });

  // Create shift mutation
  const createShiftMutation = useMutation({
    mutationFn: (shiftData: Partial<Shift>) => scheduleApi.createShift(shiftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', userId] });
      toast({
        title: 'Shift created',
        description: 'New shift has been added to your schedule.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to create shift',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Update shift mutation
  const updateShiftMutation = useMutation({
    mutationFn: ({ shiftId, shiftData }: { shiftId: string; shiftData: Partial<Shift> }) =>
      scheduleApi.updateShift(shiftId, shiftData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', userId] });
      toast({
        title: 'Shift updated',
        description: 'Your shift has been successfully updated.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to update shift',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Delete shift mutation
  const deleteShiftMutation = useMutation({
    mutationFn: (shiftId: string) => scheduleApi.deleteShift(shiftId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule', userId] });
      toast({
        title: 'Shift deleted',
        description: 'The shift has been removed from your schedule.',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Failed to delete shift',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  return {
    schedule,
    isLoading,
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    isCreating: createShiftMutation.isPending,
    isUpdating: updateShiftMutation.isPending,
    isDeleting: deleteShiftMutation.isPending,
  };
};
