import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface Shift {
  id: string;
  user_id: string;
  schedule_id?: string;
  date: string;
  start_time: string;
  end_time: string;
  type: 'Day Shift' | 'Evening Shift' | 'Morning Shift';
  skills: string[];
  marketplace: string;
  status: 'confirmed' | 'pending' | 'swap-requested' | 'cancelled';
  created_at: string;
  updated_at: string;
}

interface Schedule {
  id: string;
  user_id: string;
  week_start: string;
  total_hours: number;
  created_at: string;
  updated_at: string;
}

export const useRealSchedule = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user shifts
  const {
    data: shifts = [],
    isLoading: isLoadingShifts,
    error: shiftsError
  } = useQuery({
    queryKey: ['shifts', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];

      console.log('Fetching shifts for user:', userProfile.id);
      
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching shifts:', error);
        throw error;
      }
      
      console.log('Fetched shifts:', data);
      return data as Shift[];
    },
    enabled: !!userProfile?.id,
  });

  // Get user schedules
  const {
    data: schedules = [],
    isLoading: isLoadingSchedules,
    error: schedulesError
  } = useQuery({
    queryKey: ['schedules', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('schedules')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('week_start', { ascending: false });
      
      if (error) throw error;
      return data as Schedule[];
    },
    enabled: !!userProfile?.id,
  });

  // Create a new shift
  const createShiftMutation = useMutation({
    mutationFn: async (newShift: Omit<Shift, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert([newShift])
        .select()
        .single();
      
      if (error) throw error;
      return data as Shift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts', userProfile?.id]);
      toast({
        title: 'Shift created',
        description: 'New shift has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to create shift',
        description: error.message || 'An error occurred while creating the shift.',
        variant: 'destructive',
      });
    },
  });

  // Update an existing shift
  const updateShiftMutation = useMutation({
    mutationFn: async (updatedShift: Shift) => {
      const { data, error } = await supabase
        .from('shifts')
        .update(updatedShift)
        .eq('id', updatedShift.id)
        .select()
        .single();
      
      if (error) throw error;
      return data as Shift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts', userProfile?.id]);
      toast({
        title: 'Shift updated',
        description: 'Shift has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to update shift',
        description: error.message || 'An error occurred while updating the shift.',
        variant: 'destructive',
      });
    },
  });

  // Delete a shift
  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: string) => {
      const { data, error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', shiftId);
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['shifts', userProfile?.id]);
      toast({
        title: 'Shift deleted',
        description: 'Shift has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Failed to delete shift',
        description: error.message || 'An error occurred while deleting the shift.',
        variant: 'destructive',
      });
    },
  });

  return {
    shifts,
    schedules,
    isLoadingShifts,
    isLoadingSchedules,
    shiftsError,
    schedulesError,
    createShift: createShiftMutation.mutateAsync,
    updateShift: updateShiftMutation.mutateAsync,
    deleteShift: deleteShiftMutation.mutateAsync,
    isCreatingShift: createShiftMutation.isLoading,
    isUpdatingShift: updateShiftMutation.isLoading,
    isDeletingShift: deleteShiftMutation.isLoading,
  };
};
