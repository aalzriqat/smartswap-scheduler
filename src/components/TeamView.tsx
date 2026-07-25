import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CalendarDays, AlertTriangle } from 'lucide-react';
import { realScheduleApi } from '@/services/api';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const prettyName = (login: string) =>
  login
    .split(/[._-]/)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ');

interface DailyShift {
  day: string;
  working: boolean;
  shiftStart?: string | null;
  shiftEnd?: string | null;
}
interface ScheduleEntry {
  userLogin: string;
  skill: string;
  weekOff?: string[];
  dailyShifts: DailyShift[];
}

export const TeamView: React.FC = () => {
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['allSchedules'],
    queryFn: async () => {
      const res = await realScheduleApi.getAllSchedules({ limit: 100 });
      return (res.data || []) as ScheduleEntry[];
    },
  });

  // Coverage per day: how many team members are working each weekday.
  const coverage: Record<string, number> = {};
  DAYS.forEach((d) => (coverage[d] = 0));
  schedules.forEach((s) => {
    s.dailyShifts?.forEach((ds) => {
      if (ds.working && coverage[ds.day] !== undefined) coverage[ds.day] += 1;
    });
  });
  const minCoverage = schedules.length ? Math.min(...DAYS.map((d) => coverage[d])) : 0;

  const shiftCell = (ds?: DailyShift) => {
    if (!ds || !ds.working) return <span className="text-gray-300">—</span>;
    return (
      <span className="text-xs text-foreground whitespace-nowrap">
        {ds.shiftStart}–{ds.shiftEnd}
      </span>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground mb-1 flex items-center gap-3">
          <Users className="h-8 w-8 text-blue-600" />
          Team Coverage
        </h2>
        <p className="text-muted-foreground">
          Your team&apos;s weekly shift coverage at a glance — spot gaps and keep every day staffed.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Team Members</p>
              <p className="text-3xl font-bold text-foreground">{isLoading ? '…' : schedules.length}</p>
            </div>
            <Users className="h-8 w-8 text-blue-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Lowest Daily Coverage</p>
              <p className="text-3xl font-bold text-foreground">{isLoading ? '…' : minCoverage}</p>
            </div>
            <CalendarDays className="h-8 w-8 text-indigo-500" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Coverage Status</p>
              <p className="text-lg font-semibold mt-1">
                {minCoverage >= 3 ? (
                  <span className="text-green-600">Healthy</span>
                ) : (
                  <span className="text-amber-600">Watch gaps</span>
                )}
              </p>
            </div>
            <AlertTriangle className={`h-8 w-8 ${minCoverage >= 3 ? 'text-green-500' : 'text-amber-500'}`} />
          </CardContent>
        </Card>
      </div>

      {/* Coverage-per-day strip */}
      <Card>
        <CardHeader>
          <CardTitle>Staffed per Day</CardTitle>
          <CardDescription>Number of team members working each weekday</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {DAYS.map((d) => (
              <div key={d} className="text-center rounded-lg bg-muted/50 p-3">
                <div className="text-xs text-muted-foreground">{d}</div>
                <div className={`text-xl font-bold ${coverage[d] <= 2 ? 'text-amber-600' : 'text-foreground'}`}>
                  {coverage[d]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Roster + weekly grid */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Roster</CardTitle>
          <CardDescription>Each member&apos;s shifts across the week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium">Employee</th>
                  <th className="py-2 pr-4 font-medium">Skill</th>
                  {DAYS.map((d) => (
                    <th key={d} className="py-2 px-2 font-medium text-center">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading && (
                  <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">Loading team…</td></tr>
                )}
                {!isLoading && schedules.length === 0 && (
                  <tr><td colSpan={9} className="py-6 text-center text-muted-foreground">No team schedules found.</td></tr>
                )}
                {schedules.map((s) => {
                  const byDay: Record<string, DailyShift> = {};
                  s.dailyShifts?.forEach((ds) => (byDay[ds.day] = ds));
                  return (
                    <tr key={s.userLogin} className="border-b last:border-0 hover:bg-muted/60">
                      <td className="py-3 pr-4 font-medium text-foreground whitespace-nowrap">
                        {prettyName(s.userLogin)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant="outline">{s.skill}</Badge>
                      </td>
                      {DAYS.map((d) => (
                        <td key={d} className="py-3 px-2 text-center">
                          {shiftCell(byDay[d])}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
