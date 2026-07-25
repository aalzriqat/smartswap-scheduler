import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Users, TrendingUp, Clock, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useRealSchedule } from '@/hooks/useRealSchedule';
import { useSwapIntents } from '@/hooks/useSwapIntents';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarClock, ArrowLeftRight, Sparkles, Repeat } from 'lucide-react';
import { CreateSwapIntentModal } from './CreateSwapIntentModal';
import { SmartMatchView } from './SmartMatchView';
import { MultiHopMatchView } from './MultiHopMatchView';
import { ScheduleView } from './ScheduleView';
import { ChainManagementView } from './ChainManagementView';

export const Dashboard: React.FC = () => {
  const { user, userProfile } = useAuth();
  const { dashboardStats, isLoading } = useDashboardStats();
  const { workingDaysCount, totalHours, scheduleStats, weeklySchedule } = useRealSchedule();
  const { activeIntents } = useSwapIntents();
  const [activeView, setActiveView] = React.useState<'dashboard' | 'schedule' | 'smart-match' | 'multi-hop' | 'chains'>('dashboard');
  const [isCreateIntentOpen, setIsCreateIntentOpen] = React.useState(false);

  if (!user || !userProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Loading...</h2>
          <p className="text-gray-600">Please wait while we load your dashboard.</p>
        </div>
      </div>
    );
  }

  const renderWelcomeMessage = () => {
    const timeOfDay = new Date().getHours();
    let greeting = 'Good morning';
    
    if (timeOfDay >= 12 && timeOfDay < 17) {
      greeting = 'Good afternoon';
    } else if (timeOfDay >= 17) {
      greeting = 'Good evening';
    }

    return (
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {greeting}, {userProfile.first_name}! 👋
        </h1>
        <p className="text-gray-600">
          Welcome to your SmartSwap dashboard. Manage your shift swaps and discover new opportunities.
        </p>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-10">
      {renderWelcomeMessage()}

      {/* Quick Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded-md w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded-md w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <CalendarDays className="h-5 w-5 text-blue-500" />
                <span>Active Requests</span>
              </CardTitle>
              <CardDescription>Number of currently active swap requests</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats?.activeRequests}</div>
              <div className="text-sm text-gray-500">
                <TrendingUp className="inline-block h-4 w-4 mr-1" />
                {dashboardStats?.trends.activeRequestsChange > 0 ? (
                  <span className="text-green-500">
                    +{dashboardStats?.trends.activeRequestsChange}%
                  </span>
                ) : (
                  <span className="text-red-500">
                    {dashboardStats?.trends.activeRequestsChange}%
                  </span>
                )}
                <span> vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span>Successful Matches</span>
              </CardTitle>
              <CardDescription>Number of successful shift swap matches</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats?.successfulMatches}</div>
              <div className="text-sm text-gray-500">
                <TrendingUp className="inline-block h-4 w-4 mr-1" />
                {dashboardStats?.trends.successfulMatchesChange > 0 ? (
                  <span className="text-green-500">
                    +{dashboardStats?.trends.successfulMatchesChange}%
                  </span>
                ) : (
                  <span className="text-red-500">
                    {dashboardStats?.trends.successfulMatchesChange}%
                  </span>
                )}
                <span> vs last week</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold flex items-center space-x-2">
                <BarChart3 className="h-5 w-5 text-purple-500" />
                <span>AI Confidence</span>
              </CardTitle>
              <CardDescription>Confidence level of AI matching algorithm</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{dashboardStats?.aiConfidence}%</div>
              <div className="text-sm text-gray-500">
                <TrendingUp className="inline-block h-4 w-4 mr-1" />
                {dashboardStats?.trends.aiConfidenceChange > 0 ? (
                  <span className="text-green-500">
                    +{dashboardStats?.trends.aiConfidenceChange}%
                  </span>
                ) : (
                  <span className="text-red-500">
                    {dashboardStats?.trends.aiConfidenceChange}%
                  </span>
                )}
                <span> vs last week</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Navigation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button
                variant={activeView === 'dashboard' ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveView('dashboard')}
              >
                <Clock className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              <Button
                variant={activeView === 'schedule' ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveView('schedule')}
              >
                <CalendarDays className="h-4 w-4 mr-2" />
                My Schedule
              </Button>
              <Button
                variant={activeView === 'smart-match' ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveView('smart-match')}
              >
                <Users className="h-4 w-4 mr-2" />
                Smart Matches
              </Button>
              <Button
                variant={activeView === 'multi-hop' ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveView('multi-hop')}
              >
                <Users className="h-4 w-4 mr-2" />
                Multi-hop Swaps
              </Button>
              <Button
                variant={activeView === 'chains' ? 'secondary' : 'outline'}
                className="w-full justify-start"
                onClick={() => setActiveView('chains')}
              >
                <Users className="h-4 w-4 mr-2" />
                Swap Chains
              </Button>
              <Button
                variant="ghost"
                className="w-full justify-start text-blue-500 hover:bg-blue-50"
                onClick={() => setIsCreateIntentOpen(true)}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Swap Intent
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Area */}
        <div className="lg:col-span-3">
          {activeView === 'dashboard' && (
            <div className="space-y-6">
              {/* This week at a glance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarClock className="h-5 w-5 text-blue-600" />
                    This Week at a Glance
                  </CardTitle>
                  <CardDescription>
                    {userProfile.first_name}, here&apos;s your schedule summary
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-lg bg-blue-50 p-4 text-center">
                      <div className="text-2xl font-bold text-blue-700">{workingDaysCount}</div>
                      <div className="text-xs text-gray-600 mt-1">Working days</div>
                    </div>
                    <div className="rounded-lg bg-green-50 p-4 text-center">
                      <div className="text-2xl font-bold text-green-700">{totalHours}h</div>
                      <div className="text-xs text-gray-600 mt-1">Scheduled hours</div>
                    </div>
                    <div className="rounded-lg bg-gray-50 p-4 text-center">
                      <div className="text-2xl font-bold text-gray-700">{scheduleStats.offDays}</div>
                      <div className="text-xs text-gray-600 mt-1">Days off</div>
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                    <Badge variant="secondary">{userProfile.role}</Badge>
                    {userProfile.skills?.slice(0, 3).map((skill) => (
                      <Badge key={skill} variant="outline">{skill}</Badge>
                    ))}
                    <span className="ml-auto">Marketplace: <strong>{userProfile.marketplace}</strong></span>
                  </div>
                  <Button variant="link" className="px-0 mt-2" onClick={() => setActiveView('schedule')}>
                    View full schedule →
                  </Button>
                </CardContent>
              </Card>

              {/* Your swaps + quick actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowLeftRight className="h-5 w-5 text-indigo-600" />
                    Your Swaps
                  </CardTitle>
                  <CardDescription>
                    {activeIntents.length > 0
                      ? `You have ${activeIntents.length} active swap ${activeIntents.length === 1 ? 'request' : 'requests'}.`
                      : 'You have no active swap requests yet.'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {activeIntents.length === 0 && (
                    <p className="text-sm text-gray-600">
                      Want a different shift? Create a swap intent and SmartSwap will find the best
                      partners for you — even across multi-step swap chains.
                    </p>
                  )}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Button variant="outline" className="justify-start" onClick={() => setActiveView('smart-match')}>
                      <Sparkles className="h-4 w-4 mr-2 text-purple-600" /> Find matches
                    </Button>
                    <Button variant="outline" className="justify-start" onClick={() => setActiveView('multi-hop')}>
                      <Repeat className="h-4 w-4 mr-2 text-blue-600" /> Multi-hop swaps
                    </Button>
                    <Button className="justify-start" onClick={() => setIsCreateIntentOpen(true)}>
                      <ArrowLeftRight className="h-4 w-4 mr-2" /> New swap intent
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeView === 'schedule' && (
            <ScheduleView />
          )}

          {activeView === 'smart-match' && (
            <SmartMatchView />
          )}

          {activeView === 'multi-hop' && (
            <MultiHopMatchView />
          )}

          {activeView === 'chains' && (
            <ChainManagementView />
          )}
        </div>
      </div>

      {/* Create Swap Intent Modal */}
      <CreateSwapIntentModal
        isOpen={isCreateIntentOpen}
        onClose={() => setIsCreateIntentOpen(false)}
      />
    </div>
  );
};
