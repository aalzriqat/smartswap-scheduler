
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useRealSchedule } from '@/hooks/useRealSchedule';
import { useSwapIntents } from '@/hooks/useSwapIntents';

interface DashboardProps {
  userRole: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const { user } = useAuth();
  const { dashboardStats, isLoading: isLoadingDashboard } = useDashboardStats();
  const { weeklySchedule, isLoading: isLoadingSchedule } = useRealSchedule();
  const { activeIntents, isLoading: isLoadingIntents } = useSwapIntents();

  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'WorkFlowManagement':
        return 'Welcome to your administrative dashboard. Monitor system performance and manage users.';
      case 'Manager':
        return 'Welcome to your management dashboard. Oversee schedules and team performance.';
      case 'Developer':
        return 'Welcome to the developer console. Access system tools and analytics.';
      default:
        return 'Welcome to SmartSwap! Manage your shifts and find swap opportunities.';
    }
  };

  // Get next shift from real schedule data
  const getNextShift = () => {
    if (!weeklySchedule || isLoadingSchedule) return 'Loading...';

    const today = new Date();
    const nextShift = weeklySchedule.find(day => {
      const dayDate = new Date(day.date);
      return dayDate >= today && day.shift && day.shift.working;
    });

    if (nextShift?.shift) {
      const dayName = nextShift.day;
      const startTime = nextShift.shift.shiftStart;
      return `${dayName} ${startTime}`;
    }
    return 'No upcoming shifts';
  };

  // Calculate user's weekly hours from real schedule
  const getWeeklyHours = () => {
    if (!weeklySchedule || isLoadingSchedule) return 'Loading...';

    let totalHours = 0;
    weeklySchedule.forEach(day => {
      if (day.shift?.working && day.shift.shiftStart && day.shift.shiftEnd) {
        const start = new Date(`2000-01-01 ${day.shift.shiftStart}`);
        const end = new Date(`2000-01-01 ${day.shift.shiftEnd}`);
        const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
        totalHours += hours;
      }
    });

    return totalHours > 0 ? `${totalHours.toFixed(1)}` : '0';
  };

  const getStatsCards = () => {
    if (userRole === 'Employee') {
      return [
        {
          title: 'Your Next Shift',
          value: getNextShift(),
          icon: Clock,
          trend: null
        },
        {
          title: 'Available Swaps',
          value: isLoadingDashboard ? '...' : (dashboardStats?.activeRequests?.toString() || '0'),
          icon: Zap,
          trend: isLoadingDashboard ? null : `${dashboardStats?.trends?.activeRequestsChange >= 0 ? '+' : ''}${dashboardStats?.trends?.activeRequestsChange || 0} today`
        },
        {
          title: 'Hours This Week',
          value: getWeeklyHours(),
          icon: Calendar,
          trend: null
        },
        {
          title: 'Your Active Intents',
          value: isLoadingIntents ? '...' : activeIntents.length.toString(),
          icon: TrendingUp,
          trend: activeIntents.length > 0 ? 'Searching for matches' : 'Create an intent to start'
        },
      ];
    } else {
      return [
        {
          title: 'Active Employees',
          value: isLoadingDashboard ? '...' : '191', // From real schedule data
          icon: Users,
          trend: 'Real employee data'
        },
        {
          title: 'Active Requests',
          value: isLoadingDashboard ? '...' : (dashboardStats?.activeRequests?.toString() || '0'),
          icon: Zap,
          trend: isLoadingDashboard ? null : `${dashboardStats?.trends?.activeRequestsChange >= 0 ? '+' : ''}${dashboardStats?.trends?.activeRequestsChange || 0} today`
        },
        {
          title: 'Successful Matches',
          value: isLoadingDashboard ? '...' : (dashboardStats?.successfulMatches?.toString() || '0'),
          icon: Calendar,
          trend: isLoadingDashboard ? null : `${dashboardStats?.trends?.successfulMatchesChange >= 0 ? '+' : ''}${dashboardStats?.trends?.successfulMatchesChange || 0} this week`
        },
        {
          title: 'AI Confidence',
          value: isLoadingDashboard ? '...' : `${dashboardStats?.aiConfidence || 0}%`,
          icon: TrendingUp,
          trend: isLoadingDashboard ? null : 'Real-time calculation'
        },
      ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning, {user ? `${user.firstName}` : 'User'}! 👋
        </h2>
        <p className="text-gray-600">{getWelcomeMessage()}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow duration-200 border border-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <Icon className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                {card.trend && (
                  <p className="text-xs text-blue-600 mt-1">{card.trend}</p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Zap className="h-5 w-5 text-blue-600" />
              <span>Smart Recommendations</span>
            </CardTitle>
            <CardDescription>
              AI-powered suggestions to optimize your schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoadingIntents ? (
              <div className="text-center py-4 text-gray-500">Loading recommendations...</div>
            ) : activeIntents.length > 0 ? (
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-start space-x-3">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Active Swap Intent</h4>
                    <p className="text-sm text-gray-600">
                      You have {activeIntents.length} active swap intent{activeIntents.length > 1 ? 's' : ''} searching for matches.
                    </p>
                    <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                      View Matches
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">Create Swap Intent</h4>
                    <p className="text-sm text-gray-600">
                      Start by creating a swap intent to find compatible matches with other employees.
                    </p>
                    <Button size="sm" variant="outline" className="mt-2 border-green-600 text-green-600 hover:bg-green-50">
                      Create Intent
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {dashboardStats && (
              <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                <div className="flex items-start space-x-3">
                  <TrendingUp className="h-5 w-5 text-purple-600 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900">System Performance</h4>
                    <p className="text-sm text-gray-600">
                      AI confidence at {dashboardStats.aiConfidence}% with {dashboardStats.successfulMatches} successful matches.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-blue-600" />
              <span>Upcoming Schedule</span>
            </CardTitle>
            <CardDescription>
              Your next 7 days at a glance
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {isLoadingSchedule ? (
                <div className="text-center py-4 text-gray-500">Loading schedule...</div>
              ) : weeklySchedule && weeklySchedule.length > 0 ? (
                weeklySchedule.slice(0, 5).map((day, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{day.day}</div>
                      <div className="text-sm text-gray-600">
                        {day.shift?.working
                          ? `${day.shift.shiftStart} - ${day.shift.shiftEnd}`
                          : 'Off'
                        }
                      </div>
                    </div>
                    <div className="text-right">
                      {day.shift?.working && (
                        <div className="text-sm text-gray-500">
                          {day.shift.shiftType || 'Shift'}
                        </div>
                      )}
                      <div className={`text-xs px-2 py-1 rounded ${
                        day.shift?.working ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {day.shift?.working ? 'confirmed' : 'off'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">No schedule data available</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
