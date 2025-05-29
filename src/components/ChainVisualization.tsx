import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ArrowRight, Users, Clock, Star, AlertTriangle } from 'lucide-react';
import { SwapChain, ChainParticipant } from '@/types/api';
import { format } from 'date-fns';

interface ChainVisualizationProps {
  chain: SwapChain;
  compact?: boolean;
  showDetails?: boolean;
}

export const ChainVisualization: React.FC<ChainVisualizationProps> = ({
  chain,
  compact = false,
  showDetails = true,
}) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'proposed': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'executing': return 'bg-purple-100 text-purple-800';
      case 'executed': return 'bg-emerald-100 text-emerald-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getApprovalStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getUserInitials = (userId: string) => {
    // In a real app, you'd get user data from context or props
    return userId.slice(-2).toUpperCase();
  };

  const isExpired = new Date() > new Date(chain.expiresAt);
  const approvedCount = chain.participants.filter(p => p.approvalStatus === 'approved').length;
  const totalParticipants = chain.participants.length;

  if (compact) {
    return (
      <Card className="w-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">{totalParticipants} users</span>
              </div>
              <Badge className={getStatusColor(chain.status)}>
                {chain.status}
              </Badge>
              <div className="flex items-center space-x-1">
                <Star className={`h-4 w-4 ${getScoreColor(chain.chainScore)}`} />
                <span className={`text-sm font-medium ${getScoreColor(chain.chainScore)}`}>
                  {chain.chainScore}%
                </span>
              </div>
            </div>
            <div className="text-xs text-gray-500">
              {approvedCount}/{totalParticipants} approved
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">
            Multi-hop Swap Chain
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className={getStatusColor(chain.status)}>
              {chain.status}
            </Badge>
            {isExpired && (
              <Badge variant="destructive">
                <Clock className="h-3 w-3 mr-1" />
                Expired
              </Badge>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between text-sm text-gray-600">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Users className="h-4 w-4" />
              <span>{totalParticipants} participants</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className={`h-4 w-4 ${getScoreColor(chain.chainScore)}`} />
              <span className={getScoreColor(chain.chainScore)}>
                Score: {chain.chainScore}%
              </span>
            </div>
          </div>
          <div className="text-xs">
            Expires: {format(new Date(chain.expiresAt), 'MMM dd, yyyy HH:mm')}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Chain Flow Visualization */}
        <div className="mb-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Swap Flow</h4>
          <div className="flex items-center justify-center space-x-2 overflow-x-auto pb-2">
            {chain.participants.map((participant, index) => (
              <React.Fragment key={participant.userId}>
                <div className="flex flex-col items-center space-y-2 min-w-0 flex-shrink-0">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(participant.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge 
                    className={`text-xs ${getApprovalStatusColor(participant.approvalStatus)}`}
                    variant="secondary"
                  >
                    {participant.approvalStatus}
                  </Badge>
                </div>
                
                {index < chain.participants.length - 1 && (
                  <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
            
            {/* Show circular arrow for complete cycles */}
            {chain.participants.length > 2 && (
              <>
                <ArrowRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                <div className="flex flex-col items-center space-y-2">
                  <Avatar className="h-10 w-10 border-2 border-dashed border-gray-300">
                    <AvatarFallback className="text-xs">
                      {getUserInitials(chain.participants[0].userId)}
                    </AvatarFallback>
                  </Avatar>
                  <Badge variant="outline" className="text-xs">
                    cycle
                  </Badge>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Approval Progress */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Approval Progress</h4>
            <span className="text-sm text-gray-600">
              {approvedCount}/{totalParticipants} approved
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(approvedCount / totalParticipants) * 100}%` }}
            />
          </div>
        </div>

        {/* Chain Details */}
        {showDetails && (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">Participants</h4>
              <div className="space-y-2">
                {chain.participants.map((participant, index) => (
                  <div key={participant.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="text-xs">
                          {getUserInitials(participant.userId)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="text-sm font-medium">User {participant.userId.slice(-4)}</div>
                        <div className="text-xs text-gray-500">
                          Step {index + 1} in chain
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        className={getApprovalStatusColor(participant.approvalStatus)}
                        variant="secondary"
                      >
                        {participant.approvalStatus}
                      </Badge>
                      {participant.approvalStatus === 'approved' && participant.approvedAt && (
                        <span className="text-xs text-gray-500">
                          {format(new Date(participant.approvedAt), 'MMM dd, HH:mm')}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Business Rule Violations */}
            {chain.swapSteps.some(step => !step.businessRuleValidation.isValid) && (
              <div>
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  Business Rule Violations
                </h4>
                <div className="space-y-1">
                  {chain.swapSteps
                    .filter(step => !step.businessRuleValidation.isValid)
                    .map(step => (
                      <div key={step.stepId} className="text-sm text-red-600 bg-red-50 p-2 rounded">
                        Step {step.stepOrder}: {step.businessRuleValidation.violations.join(', ')}
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Chain Notes */}
            {chain.notes && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Notes</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  {chain.notes}
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
