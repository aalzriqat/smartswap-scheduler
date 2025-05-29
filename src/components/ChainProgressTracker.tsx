import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause,
  RotateCcw,
  Users
} from 'lucide-react';
import { SwapChain } from '@/types/api';
import { useSwapChain, useSwapChains } from '@/hooks/useSwapChains';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';

interface ChainProgressTrackerProps {
  chainId: string;
  showExecuteButton?: boolean;
}

export const ChainProgressTracker: React.FC<ChainProgressTrackerProps> = ({
  chainId,
  showExecuteButton = false,
}) => {
  const { chain, executionStatus, isLoading } = useSwapChain(chainId);
  const { executeChain, isExecuting } = useSwapChains();
  const { user } = useAuth();

  if (isLoading || !chain) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'proposed':
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'executing':
        return <Play className="h-4 w-4 text-blue-500" />;
      case 'executed':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'expired':
        return <Pause className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

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

  const getProgressPercentage = () => {
    if (chain.status === 'executed') return 100;
    if (chain.status === 'failed' || chain.status === 'expired') return 0;
    
    const approvedCount = chain.participants.filter(p => p.approvalStatus === 'approved').length;
    const totalParticipants = chain.participants.length;
    
    if (chain.status === 'executing' && executionStatus) {
      const executionProgress = (executionStatus.executedSteps / executionStatus.totalSteps) * 100;
      return 50 + (executionProgress * 0.5); // 50% for approvals + 50% for execution
    }
    
    return (approvedCount / totalParticipants) * 50; // Approvals are 50% of total progress
  };

  const canExecute = () => {
    if (!user) return false;
    
    const isInitiator = chain.initiatorUserId === user._id;
    const isAdmin = ['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role);
    const isFullyApproved = chain.participants.every(p => p.approvalStatus === 'approved');
    const isApproved = chain.status === 'approved';
    
    return (isInitiator || isAdmin) && isFullyApproved && isApproved;
  };

  const handleExecute = () => {
    executeChain(chain.chainId);
  };

  const progressPercentage = getProgressPercentage();

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            {getStatusIcon(chain.status)}
            <span>Chain Progress</span>
          </CardTitle>
          <Badge className={getStatusColor(chain.status)}>
            {chain.status}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-gray-600">{Math.round(progressPercentage)}%</span>
          </div>
          <Progress value={progressPercentage} className="h-2" />
        </div>

        {/* Approval Progress */}
        <div>
          <h3 className="text-sm font-medium mb-3">Participant Approvals</h3>
          <div className="space-y-2">
            {chain.participants.map((participant, index) => (
              <div key={participant.userId} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  <span className="text-sm">User {participant.userId.slice(-4)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {participant.approvalStatus === 'approved' && (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  )}
                  {participant.approvalStatus === 'rejected' && (
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                  )}
                  {participant.approvalStatus === 'pending' && (
                    <Clock className="h-4 w-4 text-yellow-500" />
                  )}
                  <Badge 
                    variant={participant.approvalStatus === 'approved' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {participant.approvalStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Execution Progress */}
        {(chain.status === 'executing' || chain.status === 'executed') && executionStatus && (
          <div>
            <h3 className="text-sm font-medium mb-3">Execution Progress</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Steps Completed</span>
                <span className="text-sm font-medium">
                  {executionStatus.executedSteps}/{executionStatus.totalSteps}
                </span>
              </div>
              <Progress 
                value={(executionStatus.executedSteps / executionStatus.totalSteps) * 100} 
                className="h-2"
              />
              {executionStatus.lastExecutedAt && (
                <div className="text-xs text-gray-500">
                  Last step: {format(new Date(executionStatus.lastExecutedAt), 'MMM dd, HH:mm')}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Chain Details */}
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Participants:</span>
            <div className="font-medium flex items-center space-x-1">
              <Users className="h-3 w-3" />
              <span>{chain.participants.length}</span>
            </div>
          </div>
          <div>
            <span className="text-gray-600">Chain Score:</span>
            <div className="font-medium">{chain.chainScore}%</div>
          </div>
          <div>
            <span className="text-gray-600">Created:</span>
            <div className="font-medium">
              {format(new Date(chain.createdAt), 'MMM dd, yyyy')}
            </div>
          </div>
          <div>
            <span className="text-gray-600">Expires:</span>
            <div className="font-medium">
              {format(new Date(chain.expiresAt), 'MMM dd, yyyy')}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {showExecuteButton && canExecute() && (
          <div className="pt-4 border-t">
            <Button 
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>{isExecuting ? 'Executing...' : 'Execute Chain'}</span>
            </Button>
          </div>
        )}

        {/* Status Messages */}
        {chain.status === 'failed' && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2 text-red-800">
              <AlertTriangle className="h-4 w-4" />
              <span className="text-sm font-medium">Chain execution failed</span>
            </div>
            <p className="text-xs text-red-600 mt-1">
              The chain could not be executed due to validation errors or conflicts.
            </p>
          </div>
        )}

        {chain.status === 'expired' && (
          <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-center space-x-2 text-gray-800">
              <Clock className="h-4 w-4" />
              <span className="text-sm font-medium">Chain expired</span>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              This chain expired before all participants could approve.
            </p>
          </div>
        )}

        {chain.status === 'executed' && (
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm font-medium">Chain executed successfully</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              All swap steps have been completed successfully.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
