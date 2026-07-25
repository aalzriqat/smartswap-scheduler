import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Zap, 
  Search, 
  ArrowRight, 
  Star, 
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { SwapChain, SmartMatch, SwapIntent } from '@/types/api';
import { useSwapChains } from '@/hooks/useSwapChains';
import { useSwapIntents } from '@/hooks/useSwapIntents';
import { ChainVisualization } from './ChainVisualization';
import { ChainApprovalModal } from './ChainApprovalModal';

interface MultiHopMatchViewProps {
  intent?: SwapIntent;
  directMatches?: SmartMatch[];
  onSelectMatch?: (match: SmartMatch) => void;
}

export const MultiHopMatchView: React.FC<MultiHopMatchViewProps> = ({
  intent,
  directMatches = [],
  onSelectMatch = () => {},
}) => {
  const [selectedChain, setSelectedChain] = useState<SwapChain | null>(null);
  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);
  const [detectedChains, setDetectedChains] = useState<SwapChain[]>([]);
  const { detectChains, isDetecting } = useSwapChains();
  // When rendered as a standalone tab (no intent prop), fall back to the
  // user's first active swap intent.
  const { activeIntents } = useSwapIntents();
  const activeIntent = intent ?? activeIntents[0];

  const handleDetectChains = () => {
    if (!activeIntent?._id) return;
    detectChains(
      {
        intentId: activeIntent._id,
        options: {
          maxChainLength: 5,
          minChainScore: 60,
          includePartialMatches: true,
          timeWindowDays: 30
        }
      }
    );
  };

  const handleViewChain = (chain: SwapChain) => {
    setSelectedChain(chain);
    setIsApprovalModalOpen(true);
  };

  const getMatchTypeStats = () => {
    const directCount = directMatches.length;
    const chainCount = detectedChains.length;
    const totalOptions = directCount + chainCount;
    
    return { directCount, chainCount, totalOptions };
  };

  const { directCount, chainCount, totalOptions } = getMatchTypeStats();

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Smart Matching Results</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{directCount}</div>
              <div className="text-sm text-blue-800">Direct Matches</div>
              <div className="text-xs text-blue-600 mt-1">Simple 1:1 swaps</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{chainCount}</div>
              <div className="text-sm text-purple-800">Multi-hop Chains</div>
              <div className="text-xs text-purple-600 mt-1">Complex swap sequences</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{totalOptions}</div>
              <div className="text-sm text-green-800">Total Options</div>
              <div className="text-xs text-green-600 mt-1">All available swaps</div>
            </div>
          </div>

          {/* Multi-hop Detection */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Multi-hop Swap Detection</h3>
                <p className="text-sm text-gray-600">
                  Find complex swap chains that solve scheduling conflicts for multiple users
                </p>
              </div>
              <Button 
                onClick={handleDetectChains}
                disabled={isDetecting}
                className="flex items-center space-x-2"
              >
                <Search className="h-4 w-4" />
                <span>{isDetecting ? 'Detecting...' : 'Detect Chains'}</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Tabs */}
      <Tabs defaultValue="direct" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="direct" className="flex items-center space-x-2">
            <ArrowRight className="h-4 w-4" />
            <span>Direct Matches ({directCount})</span>
          </TabsTrigger>
          <TabsTrigger value="chains" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Multi-hop Chains ({chainCount})</span>
          </TabsTrigger>
        </TabsList>

        {/* Direct Matches Tab */}
        <TabsContent value="direct" className="space-y-4">
          {directMatches.length > 0 ? (
            <div className="grid gap-4">
              {directMatches.map((match) => (
                <Card key={match._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{match.matchScore}% match</span>
                        </div>
                        <Badge variant="outline">
                          {match.status}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => onSelectMatch(match)}
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      Direct swap with compatible user
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                No direct matches found. Try detecting multi-hop chains for more options.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* Multi-hop Chains Tab */}
        <TabsContent value="chains" className="space-y-4">
          {detectedChains.length > 0 ? (
            <div className="space-y-4">
              {detectedChains.map((chain) => (
                <Card key={chain.chainId} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-purple-500" />
                          <span className="font-medium">{chain.participants.length} participants</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{chain.chainScore}% score</span>
                        </div>
                        <Badge 
                          variant={chain.status === 'proposed' ? 'default' : 'secondary'}
                        >
                          {chain.status}
                        </Badge>
                      </div>
                      <Button 
                        onClick={() => handleViewChain(chain)}
                        size="sm"
                      >
                        Review Chain
                      </Button>
                    </div>

                    {/* Mini Chain Visualization */}
                    <ChainVisualization chain={chain} compact={true} />

                    {/* Chain Benefits */}
                    <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                      {chain.chainScore >= 85 && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-3 w-3" />
                          <span>High compatibility</span>
                        </div>
                      )}
                      {chain.participants.length === 3 && (
                        <div className="flex items-center space-x-1 text-blue-600">
                          <Users className="h-3 w-3" />
                          <span>Simple 3-way swap</span>
                        </div>
                      )}
                      {new Date(chain.expiresAt).getTime() - new Date().getTime() < 24 * 60 * 60 * 1000 && (
                        <div className="flex items-center space-x-1 text-amber-600">
                          <Clock className="h-3 w-3" />
                          <span>Expires soon</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {isDetecting 
                  ? 'Detecting multi-hop swap chains...' 
                  : 'No multi-hop chains detected yet. Click "Detect Chains" to find complex swap opportunities.'
                }
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>
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
    </div>
  );
};
