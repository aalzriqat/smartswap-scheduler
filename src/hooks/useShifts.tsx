import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { scheduleApi } from '@/services/api';
import { Shift } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useShifts = (userId?: string, weekStart?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user shifts
  const { data: schedule, isLoading } = useQuery({
    queryKey: ['schedule', userId, weekStart],
    queryFn: async () => {
      if (!userId) return null;
      const response = await scheduleApi.getUserSchedule(userId, weekStart);
      return response.data;
    },
    enabled: !!userId,
  });

  // Extract shifts from schedule
  const shifts = schedule?.shifts || [];

  // Get upcoming shifts (future shifts only)
  const upcomingShifts = shifts.filter((shift: Shift) => {
    const shiftDate = new Date(shift.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return shiftDate >= today;
  });

  // Get shifts for a specific date range
  const getShiftsInRange = (startDate: string, endDate: string) => {
    return shifts.filter((shift: Shift) => {
      return shift.date >= startDate && shift.date <= endDate;
    });
  };

  // Get shifts by marketplace
  const getShiftsByMarketplace = (marketplace: string) => {
    return shifts.filter((shift: Shift) => shift.marketplace === marketplace);
  };

  // Get shifts by skill
  const getShiftsBySkill = (skill: string) => {
    return shifts.filter((shift: Shift) => shift.skills.includes(skill));
  };

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

  // Find shift by ID
  const findShiftById = (shiftId: string) => {
    return shifts.find((shift: Shift) => shift._id === shiftId);
  };

  // Check if user has shifts on a specific date
  const hasShiftsOnDate = (date: string) => {
    return shifts.some((shift: Shift) => shift.date === date);
  };

  // Get total hours for a date range
  const getTotalHours = (startDate?: string, endDate?: string) => {
    let targetShifts = shifts;
    
    if (startDate && endDate) {
      targetShifts = getShiftsInRange(startDate, endDate);
    }

    return targetShifts.reduce((total: number, shift: Shift) => {
      const start = new Date(`2000-01-01T${shift.startTime}`);
      const end = new Date(`2000-01-01T${shift.endTime}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  return {
    // Data
    shifts,
    upcomingShifts,
    schedule,
    
    // Loading state
    isLoading,
    
    // Utility functions
    getShiftsInRange,
    getShiftsByMarketplace,
    getShiftsBySkill,
    findShiftById,
    hasShiftsOnDate,
    getTotalHours,
    
    // Mutations
    createShift: createShiftMutation.mutate,
    updateShift: updateShiftMutation.mutate,
    deleteShift: deleteShiftMutation.mutate,
    
    // Mutation states
    isCreating: createShiftMutation.isPending,
    isUpdating: updateShiftMutation.isPending,
    isDeleting: deleteShiftMutation.isPending,
  };
};
