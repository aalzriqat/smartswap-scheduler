
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, MapPin, Star, Users, ArrowRight } from 'lucide-react';

interface SmartMatchViewProps {
  userRole: string;
}

export const SmartMatchView: React.FC<SmartMatchViewProps> = ({ userRole }) => {
  const [selectedMatch, setSelectedMatch] = useState<number | null>(null);

  const smartMatches = [
    {
      id: 1,
      matchScore: 96,
      employee: 'Alex Johnson',
      originalShift: 'Friday 2:00 PM - 10:00 PM',
      wantedShift: 'Monday 9:00 AM - 5:00 PM',
      skills: ['PhoneMU', 'Email', 'General'],
      marketplace: 'AE',
      compatibility: 'Perfect Match',
      reason: 'Exact skill match, same marketplace, both prefer the swap'
    },
    {
      id: 2,
      matchScore: 89,
      employee: 'Sarah Chen',
      originalShift: 'Saturday 10:00 AM - 6:00 PM',
      wantedShift: 'Wednesday 2:00 PM - 10:00 PM',
      skills: ['MuOnly', 'Specialty'],
      marketplace: 'SA',
      compatibility: 'High Match',
      reason: 'Skill overlap, preferred time slots align'
    },
    {
      id: 3,
      matchScore: 82,
      employee: 'Mike Rodriguez',
      originalShift: 'Thursday 6:00 AM - 2:00 PM',
      wantedShift: 'Friday 2:00 PM - 10:00 PM',
      skills: ['phoneOnly', 'General'],
      marketplace: 'UK',
      compatibility: 'Good Match',
      reason: 'Time preference match, cross-training opportunity'
    }
  ];

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 80) return 'text-blue-600 bg-blue-100';
    return 'text-yellow-600 bg-yellow-100';
  };

  const getCompatibilityColor = (compatibility: string) => {
    if (compatibility === 'Perfect Match') return 'bg-green-500';
    if (compatibility === 'High Match') return 'bg-blue-500';
    return 'bg-yellow-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
          <Zap className="h-8 w-8 text-blue-600" />
          <span>SmartSwap Matchmaking</span>
        </h2>
        <p className="text-gray-600">
          AI-powered shift matching finds the perfect swap partners based on skills, preferences, and availability.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">24</div>
            <p className="text-blue-100">+6 from yesterday</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Successful Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">187</div>
            <p className="text-green-100">94% success rate</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">98.2%</div>
            <p className="text-purple-100">Improving daily</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>Top SmartSwap Recommendations</span>
          </CardTitle>
          <CardDescription>
            Ranked by compatibility score and mutual benefit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {smartMatches.map((match) => (
              <div
                key={match.id}
                className={`p-6 border rounded-lg transition-all duration-200 cursor-pointer ${
                  selectedMatch === match.id 
                    ? 'border-blue-500 bg-blue-50 shadow-md' 
                    : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                }`}
                onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="flex items-center space-x-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span className="font-semibold text-gray-900">{match.employee}</span>
                      </div>
                      <Badge className={`${getScoreColor(match.matchScore)} border-0`}>
                        {match.matchScore}% Match
                      </Badge>
                      <Badge className={`${getCompatibilityColor(match.compatibility)} text-white border-0`}>
                        {match.compatibility}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Offering:</span>
                        </div>
                        <div className="font-medium text-gray-900">{match.originalShift}</div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="text-sm text-gray-600">Wants:</span>
                        </div>
                        <div className="font-medium text-gray-900">{match.wantedShift}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600">Marketplace:</span>
                        <Badge variant="outline">{match.marketplace}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">Skills:</span>
                        {match.skills.map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-4">{match.reason}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Connect
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-blue-600 text-blue-600 hover:bg-blue-50"
                    >
                      Details
                    </Button>
                  </div>
                </div>
                
                {selectedMatch === match.id && (
                  <div className="mt-4 pt-4 border-t border-blue-200 bg-white p-4 rounded">
                    <h4 className="font-medium text-gray-900 mb-2">Match Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Skill Compatibility:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-green-500 h-2 rounded-full" 
                            style={{ width: `${match.matchScore}%` }}
                          ></div>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600">Schedule Fit:</span>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-blue-500 h-2 rounded-full" 
                            style={{ width: `${Math.min(match.matchScore + 5, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
