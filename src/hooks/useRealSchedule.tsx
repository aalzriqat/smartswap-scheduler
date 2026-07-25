import { useQuery } from '@tanstack/react-query';
import { realScheduleApi } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

const DAY_LABELS: Record<string, string> = {
  Sun: 'Sunday', Mon: 'Monday', Tue: 'Tuesday', Wed: 'Wednesday',
  Thu: 'Thursday', Fri: 'Friday', Sat: 'Saturday',
};

const toHour = (t?: string | null) => {
  if (!t) return 0;
  const [h, m] = t.split(':').map(Number);
  return h + (m || 0) / 60;
};

const shiftType = (start?: string | null): 'Morning Shift' | 'Day Shift' | 'Evening Shift' => {
  const h = toHour(start);
  if (h < 12) return 'Morning Shift';
  if (h < 16) return 'Day Shift';
  return 'Evening Shift';
};

// Fetch the current user's real schedule from the API and transform it into the
// shape ScheduleView expects.
export const useRealSchedule = () => {
  const { userProfile } = useAuth();

  const { data: schedule, isLoading } = useQuery({
    queryKey: ['myRealSchedule', userProfile?.id],
    queryFn: async () => {
      try {
        const res = await realScheduleApi.getMySchedule();
        return res.data;
      } catch {
        return null;
      }
    },
    enabled: !!userProfile?.id,
  });

  const dailyShifts: any[] = schedule?.dailyShifts || [];

  const weeklySchedule = dailyShifts.map((d: any) => ({
    day: DAY_LABELS[d.day] || d.day,
    date: DAY_LABELS[d.day] || d.day,
    shift: d.working
      ? {
          status: 'confirmed' as const,
          type: shiftType(d.shiftStart),
          startTime: d.shiftStart,
          endTime: d.shiftEnd,
          marketplace: userProfile?.marketplace || 'AE',
          skills: schedule?.skill ? [schedule.skill] : [],
        }
      : null,
  }));

  const workingDaysCount = dailyShifts.filter((d: any) => d.working).length;
  const totalHours = dailyShifts.reduce(
    (sum: number, d: any) => sum + (d.working ? Math.max(0, toHour(d.shiftEnd) - toHour(d.shiftStart)) : 0),
    0
  );

  const transformedSchedule = {
    weekOff: (schedule?.weekOff || []).map((day: string) => DAY_LABELS[day] || day),
    skill: schedule?.skill || '',
    lunch: schedule?.lunch || '',
    break1: schedule?.break1 || '',
    break2: schedule?.break2 || '',
  };

  const scheduleStats = {
    totalHours: Math.round(totalHours),
    workingDays: workingDaysCount,
    offDays: dailyShifts.length ? dailyShifts.length - workingDaysCount : 0,
    skill: schedule?.skill || '',
  };

  return {
    weeklySchedule,
    workingDaysCount,
    totalHours: Math.round(totalHours),
    transformedSchedule,
    scheduleStats,
    isLoading,
  };
};
