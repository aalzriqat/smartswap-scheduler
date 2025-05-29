import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Play,
  Eye,
  Filter
} from 'lucide-react';
import { useSwapChains, useChainApprovals } from '@/hooks/useSwapChains';
import { useAuth } from '@/contexts/AuthContext';
import { ChainVisualization } from './ChainVisualization';
import { ChainApprovalModal } from './ChainApprovalModal';
import { ChainProgressTracker } from './ChainProgressTracker';
import { SwapChain } from '@/types/api';

export const ChainManagementView: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState<SwapChain | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [isProgressModalOpen, setIsProgressModalOpen] = useState(false);
  const { user } = useAuth();
  
  const { 
    userChains, 
    activeChains, 
    isLoadingUserChains, 
    isLoadingActiveChains,
    executeChain,
    isExecuting
  } = useSwapChains();
  
  const { 
    pendingApprovals, 
    approvedChains, 
    rejectedChains, 
    totalPending 
  } = useChainApprovals();

  const handleViewChain = (chain: SwapChain) => {
    setSelectedChain(chain);
    setIsApprovalModalOpen(true);
  };

  const handleViewProgress = (chain: SwapChain) => {
    setSelectedChain(chain);
    setIsProgressModalOpen(true);
  };

  const handleExecuteChain = (chainId: string) => {
    executeChain(chainId);
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

  const canExecuteChain = (chain: SwapChain) => {
    if (!user) return false;
    
    const isInitiator = chain.initiatorUserId === user._id;
    const isAdmin = ['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role);
    const isFullyApproved = chain.participants.every(p => p.approvalStatus === 'approved');
    const isApproved = chain.status === 'approved';
    
    return (isInitiator || isAdmin) && isFullyApproved && isApproved;
  };

  if (isLoadingUserChains) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Multi-hop Swap Chains</h2>
          <p className="text-gray-600">Manage complex swap chains and approvals</p>
        </div>
        {totalPending > 0 && (
          <Badge variant="destructive" className="text-sm">
            {totalPending} pending approval{totalPending > 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{totalPending}</div>
                <div className="text-xs text-gray-600">Pending Approvals</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{approvedChains.length}</div>
                <div className="text-xs text-gray-600">Approved Chains</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{userChains.length}</div>
                <div className="text-xs text-gray-600">Total Chains</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Play className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">
                  {userChains.filter(c => c.status === 'executed').length}
                </div>
                <div className="text-xs text-gray-600">Executed</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain Tabs */}
      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="pending" className="flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Pending ({totalPending})</span>
          </TabsTrigger>
          <TabsTrigger value="approved" className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Approved ({approvedChains.length})</span>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>All Chains ({userChains.length})</span>
          </TabsTrigger>
          {user?.role && ['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role) && (
            <TabsTrigger value="active" className="flex items-center space-x-2">
              <Filter className="h-4 w-4" />
              <span>System Active</span>
            </TabsTrigger>
          )}
        </TabsList>

        {/* Pending Approvals Tab */}
        <TabsContent value="pending" className="space-y-4">
          {pendingApprovals.length > 0 ? (
            <div className="space-y-4">
              {pendingApprovals.map((chain) => (
                <Card key={chain.chainId} className="border-yellow-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(chain.status)}>
                          {chain.status}
                        </Badge>
                        <span className="font-medium">
                          {chain.participants.length}-person chain
                        </span>
                        <span className="text-sm text-gray-600">
                          Score: {chain.chainScore}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleViewChain(chain)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Review</span>
                        </Button>
                      </div>
                    </div>
                    <ChainVisualization chain={chain} compact={true} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                No pending approvals. All your chains are up to date!
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Approved Chains Tab */}
        <TabsContent value="approved" className="space-y-4">
          {approvedChains.length > 0 ? (
            <div className="space-y-4">
              {approvedChains.map((chain) => (
                <Card key={chain.chainId} className="border-green-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(chain.status)}>
                          {chain.status}
                        </Badge>
                        <span className="font-medium">
                          {chain.participants.length}-person chain
                        </span>
                        <span className="text-sm text-gray-600">
                          Score: {chain.chainScore}%
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewProgress(chain)}
                          className="flex items-center space-x-1"
                        >
                          <Eye className="h-3 w-3" />
                          <span>Progress</span>
                        </Button>
                        {canExecuteChain(chain) && (
                          <Button
                            size="sm"
                            onClick={() => handleExecuteChain(chain.chainId)}
                            disabled={isExecuting}
                            className="flex items-center space-x-1"
                          >
                            <Play className="h-3 w-3" />
                            <span>Execute</span>
                          </Button>
                        )}
                      </div>
                    </div>
                    <ChainVisualization chain={chain} compact={true} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No approved chains yet. Chains will appear here once all participants approve.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* All Chains Tab */}
        <TabsContent value="all" className="space-y-4">
          {userChains.length > 0 ? (
            <div className="space-y-4">
              {userChains.map((chain) => (
                <Card key={chain.chainId}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={getStatusColor(chain.status)}>
                          {chain.status}
                        </Badge>
                        <span className="font-medium">
                          {chain.participants.length}-person chain
                        </span>
                        <span className="text-sm text-gray-600">
                          Score: {chain.chainScore}%
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewProgress(chain)}
                        className="flex items-center space-x-1"
                      >
                        <Eye className="h-3 w-3" />
                        <span>Details</span>
                      </Button>
                    </div>
                    <ChainVisualization chain={chain} compact={true} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No chains found. Create swap intents to discover multi-hop opportunities.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* System Active Chains Tab (Admin only) */}
        {user?.role && ['WorkFlowManagement', 'Developer', 'Manager'].includes(user.role) && (
          <TabsContent value="active" className="space-y-4">
            {isLoadingActiveChains ? (
              <div className="animate-pulse space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ) : activeChains.length > 0 ? (
              <div className="space-y-4">
                {activeChains.map((chain) => (
                  <Card key={chain.chainId}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(chain.status)}>
                            {chain.status}
                          </Badge>
                          <span className="font-medium">
                            {chain.participants.length}-person chain
                          </span>
                          <span className="text-sm text-gray-600">
                            Score: {chain.chainScore}%
                          </span>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewProgress(chain)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-3 w-3" />
                            <span>Monitor</span>
                          </Button>
                          {canExecuteChain(chain) && (
                            <Button
                              size="sm"
                              onClick={() => handleExecuteChain(chain.chainId)}
                              disabled={isExecuting}
                              className="flex items-center space-x-1"
                            >
                              <Play className="h-3 w-3" />
                              <span>Execute</span>
                            </Button>
                          )}
                        </div>
                      </div>
                      <ChainVisualization chain={chain} compact={true} />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  No active chains in the system.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
        )}
      </Tabs>

      {/* Chain Approval Modal */}
      <ChainApprovalModal
        chain={selectedChain}
        isOpen={isApprovalModalOpen}
        onClose={() => {
          setIsApprovalModalOpen(false);
          setSelectedChain(null);
        }}
      />

      {/* Chain Progress Modal */}
      {selectedChain && (
        <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isProgressModalOpen ? 'block' : 'hidden'}`}>
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Chain Progress</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsProgressModalOpen(false)}
              >
                Close
              </Button>
            </div>
            <ChainProgressTracker 
              chainId={selectedChain.chainId} 
              showExecuteButton={canExecuteChain(selectedChain)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
