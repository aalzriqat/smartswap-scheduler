import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { realScheduleApi } from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useRealSchedule = (userLogin?: string) => {
  const { toast } = useToast();
  const { user } = useAuth();

  // If userLogin is provided, use it for specific user lookup (admin/manager view)
  // Otherwise, get the authenticated user's own schedule
  const isOwnSchedule = !userLogin;

  // Get user's real schedule
  const { data: userSchedule, isLoading: isLoadingSchedule } = useQuery({
    queryKey: isOwnSchedule ? ['my-real-schedule'] : ['real-schedule', userLogin],
    queryFn: async () => {
      if (isOwnSchedule) {
        // Get authenticated user's own schedule
        const response = await realScheduleApi.getMySchedule();
        return response.data;
      } else {
        // Get specific user's schedule (for admin/manager view)
        const response = await realScheduleApi.getScheduleByUserLogin(userLogin);
        return response.data;
      }
    },
    enabled: isOwnSchedule ? !!user : !!userLogin,
  });

  // Get available skills
  const { data: availableSkills, isLoading: isLoadingSkills } = useQuery({
    queryKey: ['real-schedule-skills'],
    queryFn: async () => {
      const response = await realScheduleApi.getAvailableSkills();
      return response.data;
    },
  });

  // Get schedule statistics
  const { data: scheduleStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['real-schedule-stats'],
    queryFn: async () => {
      const response = await realScheduleApi.getScheduleStats();
      return response.data;
    },
  });

  // Find potential swap matches
  const targetUserLogin = userLogin || user?.userLogin;
  const { data: swapMatches, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['real-schedule-matches', targetUserLogin],
    queryFn: async () => {
      if (!targetUserLogin) return [];
      const response = await realScheduleApi.findSwapMatches(targetUserLogin);
      return response.data;
    },
    enabled: !!targetUserLogin,
  });

  // Helper function to determine shift type
  const getShiftType = (startTime: string | null): string => {
    if (!startTime) return 'Day Off';

    const hour = parseInt(startTime.split(':')[0]);
    if (hour >= 5 && hour < 12) return 'Morning Shift';
    if (hour >= 12 && hour < 18) return 'Day Shift';
    if (hour >= 18 || hour < 5) return 'Evening Shift';
    return 'Day Shift';
  };

  // Helper function to format time
  const formatTime = (time: string | null): string => {
    if (!time) return '';

    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;

    return `${displayHour}:${minutes} ${ampm}`;
  };

  // Helper to extract marketplace from skill
  const getMarketplaceFromSkill = (skill: string): string => {
    if (skill.includes('AE')) return 'AE';
    if (skill.includes('SA')) return 'SA';
    if (skill.includes('UK')) return 'UK';
    if (skill.includes('EG')) return 'EG';
    return 'AE'; // Default
  };

  // Transform daily shifts to a more usable format
  const transformedSchedule = userSchedule ? {
    userLogin: userSchedule.userLogin,
    skill: userSchedule.skill,
    weekOff: userSchedule.weekOff,
    lunch: userSchedule.lunch,
    break1: userSchedule.break1,
    break2: userSchedule.break2,
    dailyShifts: userSchedule.dailyShifts?.map((shift: any) => ({
      day: shift.day,
      working: shift.working,
      shiftStart: shift.shiftStart,
      shiftEnd: shift.shiftEnd,
      // Calculate shift type based on start time
      shiftType: getShiftType(shift.shiftStart),
      // Format time display
      timeDisplay: shift.working && shift.shiftStart && shift.shiftEnd
        ? `${formatTime(shift.shiftStart)} - ${formatTime(shift.shiftEnd)}`
        : null,
    })) || []
  } : null;

  // Get working days count
  const getWorkingDaysCount = (): number => {
    if (!transformedSchedule) return 0;
    return transformedSchedule.dailyShifts.filter(shift => shift.working).length;
  };

  // Get total hours for the week
  const getTotalHours = (): number => {
    if (!transformedSchedule) return 0;

    return transformedSchedule.dailyShifts.reduce((total, shift) => {
      if (!shift.working || !shift.shiftStart || !shift.shiftEnd) return total;

      const start = new Date(`2000-01-01T${shift.shiftStart}`);
      const end = new Date(`2000-01-01T${shift.shiftEnd}`);

      // Handle overnight shifts
      if (end < start) {
        end.setDate(end.getDate() + 1);
      }

      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      return total + hours;
    }, 0);
  };

  // Get shifts by day of week
  const getShiftsByDay = () => {
    if (!transformedSchedule) return [];

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const currentDate = new Date();
    const startOfWeek = new Date(currentDate.setDate(currentDate.getDate() - currentDate.getDay()));

    return transformedSchedule.dailyShifts.map((shift, index) => {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + index);

      return {
        day: daysOfWeek[index],
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        fullDate: date.toISOString().split('T')[0],
        shift: shift.working ? {
          time: shift.timeDisplay,
          type: shift.shiftType,
          skills: [transformedSchedule.skill],
          marketplace: getMarketplaceFromSkill(transformedSchedule.skill),
          status: 'confirmed'
        } : null
      };
    });
  };

  return {
    // Raw data
    userSchedule,
    availableSkills,
    scheduleStats,
    swapMatches,

    // Transformed data
    transformedSchedule,
    weeklySchedule: getShiftsByDay(),

    // Calculated values
    workingDaysCount: getWorkingDaysCount(),
    totalHours: getTotalHours(),

    // Loading states
    isLoading: isLoadingSchedule || isLoadingSkills || isLoadingStats,
    isLoadingSchedule,
    isLoadingSkills,
    isLoadingStats,
    isLoadingMatches,

    // Helper functions
    getShiftType,
    formatTime,
  };
};

// Hook for getting all schedules with filtering
export const useAllRealSchedules = (filters?: { limit?: number; skill?: string; userLogin?: string }) => {
  const { data: schedules, isLoading } = useQuery({
    queryKey: ['real-schedules', filters],
    queryFn: async () => {
      const response = await realScheduleApi.getAllSchedules(filters);
      return response.data;
    },
  });

  return {
    schedules,
    isLoading,
  };
};
