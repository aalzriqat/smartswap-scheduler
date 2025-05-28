
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, RotateCcw } from 'lucide-react';

interface ScheduleViewProps {
  userRole: string;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({ userRole }) => {
  const [selectedWeek, setSelectedWeek] = useState('current');

  const scheduleData = [
    {
      day: 'Monday',
      date: 'Dec 18',
      shifts: [
        { time: '9:00 AM - 5:00 PM', type: 'Day Shift', skills: ['PhoneMU', 'Email'], marketplace: 'AE', status: 'confirmed' }
      ]
    },
    {
      day: 'Tuesday',
      date: 'Dec 19',
      shifts: [
        { time: '9:00 AM - 5:00 PM', type: 'Day Shift', skills: ['PhoneMU', 'Email'], marketplace: 'AE', status: 'confirmed' }
      ]
    },
    {
      day: 'Wednesday',
      date: 'Dec 20',
      shifts: []
    },
    {
      day: 'Thursday',
      date: 'Dec 21',
      shifts: [
        { time: '2:00 PM - 10:00 PM', type: 'Evening Shift', skills: ['MuOnly', 'Specialty'], marketplace: 'SA', status: 'pending' }
      ]
    },
    {
      day: 'Friday',
      date: 'Dec 22',
      shifts: [
        { time: '9:00 AM - 5:00 PM', type: 'Day Shift', skills: ['General'], marketplace: 'UK', status: 'swap-requested' }
      ]
    },
    {
      day: 'Saturday',
      date: 'Dec 23',
      shifts: [
        { time: '10:00 AM - 6:00 PM', type: 'Day Shift', skills: ['phoneOnly'], marketplace: 'EG', status: 'confirmed' }
      ]
    },
    {
      day: 'Sunday',
      date: 'Dec 24',
      shifts: []
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'swap-requested': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getShiftTypeColor = (type: string) => {
    switch (type) {
      case 'Day Shift': return 'bg-blue-500';
      case 'Evening Shift': return 'bg-purple-500';
      case 'Morning Shift': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
          <Calendar className="h-8 w-8 text-blue-600" />
          <span>Schedule Management</span>
        </h2>
        <p className="text-gray-600">
          View and manage your weekly schedule with real-time updates and swap opportunities.
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="space-x-2">
          <Button 
            variant={selectedWeek === 'previous' ? 'default' : 'outline'}
            onClick={() => setSelectedWeek('previous')}
          >
            Previous Week
          </Button>
          <Button 
            variant={selectedWeek === 'current' ? 'default' : 'outline'}
            onClick={() => setSelectedWeek('current')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Current Week
          </Button>
          <Button 
            variant={selectedWeek === 'next' ? 'default' : 'outline'}
            onClick={() => setSelectedWeek('next')}
          >
            Next Week
          </Button>
        </div>
        
        <div className="text-sm text-gray-600 flex items-center space-x-2">
          <Clock className="h-4 w-4" />
          <span>Week of December 18-24, 2023</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {scheduleData.map((day, index) => (
          <Card key={index} className={`transition-all duration-200 ${
            day.shifts.length > 0 ? 'hover:shadow-lg border-blue-100' : 'bg-gray-50'
          }`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold text-gray-900">
                {day.day}
              </CardTitle>
              <CardDescription className="text-sm text-gray-500">
                {day.date}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {day.shifts.length === 0 ? (
                <div className="text-center py-4">
                  <span className="text-gray-400 text-sm">Day Off</span>
                </div>
              ) : (
                day.shifts.map((shift, shiftIndex) => (
                  <div key={shiftIndex} className="space-y-3">
                    <div className={`p-3 rounded-lg border ${getStatusColor(shift.status)}`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-sm">{shift.time}</span>
                        {shift.status === 'swap-requested' && (
                          <RotateCcw className="h-4 w-4" />
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getShiftTypeColor(shift.type)}`}></div>
                          <span className="text-xs text-gray-600">{shift.type}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          <MapPin className="h-3 w-3 text-gray-500" />
                          <Badge variant="outline" className="text-xs">
                            {shift.marketplace}
                          </Badge>
                        </div>
                        
                        <div className="flex flex-wrap gap-1">
                          {shift.skills.map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {shift.status === 'swap-requested' && (
                      <Button size="sm" variant="outline" className="w-full text-xs">
                        View Swap Options
                      </Button>
                    )}
                    
                    {shift.status === 'confirmed' && (
                      <Button size="sm" variant="ghost" className="w-full text-xs text-blue-600">
                        Request Swap
                      </Button>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Schedule Statistics</CardTitle>
          <CardDescription>Your scheduling insights for this week</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">38.5</div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">5</div>
              <div className="text-sm text-gray-600">Working Days</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">3</div>
              <div className="text-sm text-gray-600">Marketplaces</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">96%</div>
              <div className="text-sm text-gray-600">Schedule Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
