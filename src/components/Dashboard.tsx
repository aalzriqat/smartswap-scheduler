import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ArrowLeftRight, CheckCircle, Sparkles, Repeat, CalendarClock, TrendingUp, TrendingDown, Link2,
} from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useRealSchedule } from '@/hooks/useRealSchedule';
import { useSwapIntents } from '@/hooks/useSwapIntents';
import { useAuth } from '@/contexts/AuthContext';
import { CreateSwapIntentModal } from './CreateSwapIntentModal';

interface DashboardProps {
  onNavigate?: (view: string) => void;
}

const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  tint: string;
}> = ({ label, value, change, icon: Icon, tint }) => (
  <Card className="card-hover">
    <CardContent className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-bold font-display tracking-tight">{value}</p>
        </div>
        <div className={`grid place-items-center h-11 w-11 rounded-xl ${tint}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {typeof change === 'number' && (
        <div className="mt-3 flex items-center gap-1 text-xs">
          {change >= 0 ? (
            <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="h-3.5 w-3.5" /> +{change}%
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-red-500">
              <TrendingDown className="h-3.5 w-3.5" /> {change}%
            </span>
          )}
          <span className="text-muted-foreground">vs last week</span>
        </div>
      )}
    </CardContent>
  </Card>
);

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const { dashboardStats } = useDashboardStats();
  const { workingDaysCount, totalHours, scheduleStats } = useRealSchedule();
  const { activeIntents } = useSwapIntents();
  const [isCreateIntentOpen, setIsCreateIntentOpen] = React.useState(false);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl lg:text-3xl font-bold font-display">
          {greeting}, {userProfile?.first_name}! <span className="align-middle">👋</span>
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your shifts and discover new swap opportunities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          label="Active Requests"
          value={dashboardStats?.activeRequests ?? 0}
          change={dashboardStats?.trends?.activeRequestsChange}
          icon={ArrowLeftRight}
          tint="bg-indigo-500/10 text-indigo-500"
        />
        <StatCard
          label="Successful Matches"
          value={dashboardStats?.successfulMatches ?? 0}
          change={dashboardStats?.trends?.successfulMatchesChange}
          icon={CheckCircle}
          tint="bg-emerald-500/10 text-emerald-500"
        />
        <StatCard
          label="AI Confidence"
          value={`${dashboardStats?.aiConfidence ?? 0}%`}
          change={dashboardStats?.trends?.aiConfidenceChange}
          icon={Sparkles}
          tint="bg-violet-500/10 text-violet-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* This week */}
        <Card className="lg:col-span-2">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-5 w-5 text-indigo-500" />
              <h2 className="font-display text-lg font-semibold">This Week at a Glance</h2>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl bg-indigo-500/5 border border-indigo-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-indigo-500">{workingDaysCount}</div>
                <div className="text-xs text-muted-foreground mt-1">Working days</div>
              </div>
              <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/10 p-4 text-center">
                <div className="text-2xl font-bold text-emerald-500">{totalHours}h</div>
                <div className="text-xs text-muted-foreground mt-1">Scheduled hours</div>
              </div>
              <div className="rounded-xl bg-muted p-4 text-center">
                <div className="text-2xl font-bold">{scheduleStats.offDays}</div>
                <div className="text-xs text-muted-foreground mt-1">Days off</div>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              <Badge variant="secondary">{userProfile?.role}</Badge>
              {userProfile?.skills?.slice(0, 3).map((s) => (
                <Badge key={s} variant="outline">{s}</Badge>
              ))}
              <span className="ml-auto text-sm text-muted-foreground">
                Marketplace: <strong className="text-foreground">{userProfile?.marketplace}</strong>
              </span>
            </div>
            <Button variant="link" className="px-0 mt-1" onClick={() => onNavigate?.('schedule')}>
              View full schedule →
            </Button>
          </CardContent>
        </Card>

        {/* Your swaps + quick actions */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-1">
              <ArrowLeftRight className="h-5 w-5 text-violet-500" />
              <h2 className="font-display text-lg font-semibold">Your Swaps</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {activeIntents.length > 0
                ? `${activeIntents.length} active request${activeIntents.length === 1 ? '' : 's'}.`
                : 'No active swap requests yet.'}
            </p>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('smartmatch')}>
                <Sparkles className="h-4 w-4 mr-2 text-violet-500" /> Find matches
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('multihop')}>
                <Repeat className="h-4 w-4 mr-2 text-indigo-500" /> Multi-hop swaps
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('chains')}>
                <Link2 className="h-4 w-4 mr-2 text-blue-500" /> Swap chains
              </Button>
              <Button className="w-full justify-start" onClick={() => setIsCreateIntentOpen(true)}>
                <ArrowLeftRight className="h-4 w-4 mr-2" /> New swap intent
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <CreateSwapIntentModal isOpen={isCreateIntentOpen} onClose={() => setIsCreateIntentOpen(false)} />
    </div>
  );
};
