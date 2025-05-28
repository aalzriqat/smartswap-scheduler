
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Clock, TrendingUp, Users, Zap, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DashboardProps {
  userRole: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ userRole }) => {
  const getWelcomeMessage = () => {
    switch (userRole) {
      case 'Admin':
        return 'Welcome to your administrative dashboard. Monitor system performance and manage users.';
      case 'Manager':
        return 'Welcome to your management dashboard. Oversee schedules and team performance.';
      case 'Developer':
        return 'Welcome to the developer console. Access system tools and analytics.';
      default:
        return 'Welcome to SmartSwap! Manage your shifts and find swap opportunities.';
    }
  };

  const getStatsCards = () => {
    if (userRole === 'Employee') {
      return [
        { title: 'Your Next Shift', value: 'Tomorrow 9:00 AM', icon: Clock, trend: null },
        { title: 'Available Swaps', value: '12', icon: Zap, trend: '+3 new' },
        { title: 'Hours This Week', value: '38.5', icon: Calendar, trend: '2.5 overtime' },
        { title: 'Swap Success Rate', value: '94%', icon: TrendingUp, trend: '+2% this month' },
      ];
    } else {
      return [
        { title: 'Active Employees', value: '247', icon: Users, trend: '+12 this month' },
        { title: 'Pending Swaps', value: '18', icon: Zap, trend: '6 urgent' },
        { title: 'Schedule Coverage', value: '96.8%', icon: Calendar, trend: '+1.2% improvement' },
        { title: 'System Efficiency', value: '99.1%', icon: TrendingUp, trend: 'All systems optimal' },
      ];
    }
  };

  const statsCards = getStatsCards();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Good morning, {userRole === 'Employee' ? 'Sarah' : 'Administrator'}! 👋
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
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Swap Opportunity</h4>
                  <p className="text-sm text-gray-600">
                    John Miller wants to swap his Friday morning shift for any weekend slot.
                  </p>
                  <Button size="sm" className="mt-2 bg-blue-600 hover:bg-blue-700">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-start space-x-3">
                <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900">Schedule Optimization</h4>
                  <p className="text-sm text-gray-600">
                    Your current schedule has 95% efficiency. Consider these adjustments for better work-life balance.
                  </p>
                  <Button size="sm" variant="outline" className="mt-2 border-green-600 text-green-600 hover:bg-green-50">
                    Optimize
                  </Button>
                </div>
              </div>
            </div>
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
              {[
                { day: 'Monday', shift: '9:00 AM - 5:00 PM', type: 'Day Shift', status: 'confirmed' },
                { day: 'Tuesday', shift: '9:00 AM - 5:00 PM', type: 'Day Shift', status: 'confirmed' },
                { day: 'Wednesday', shift: 'Off', type: null, status: 'off' },
                { day: 'Thursday', shift: '2:00 PM - 10:00 PM', type: 'Evening Shift', status: 'pending' },
                { day: 'Friday', shift: '9:00 AM - 5:00 PM', type: 'Day Shift', status: 'confirmed' },
              ].map((day, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{day.day}</div>
                    <div className="text-sm text-gray-600">{day.shift}</div>
                  </div>
                  <div className="text-right">
                    {day.type && <div className="text-sm text-gray-500">{day.type}</div>}
                    <div className={`text-xs px-2 py-1 rounded ${
                      day.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                      day.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {day.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
