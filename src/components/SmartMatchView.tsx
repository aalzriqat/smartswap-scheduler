
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusBadge } from '@/components/ui/status-badge';
import { MatchScoreBar } from '@/components/ui/match-score-bar';
import { SmartMatchSkeleton, SmartMatchHeaderSkeleton } from '@/components/ui/smart-match-skeleton';
import { LiveTrackingIndicator } from '@/components/ui/live-tracking-indicator';
import { MatchCelebration } from '@/components/ui/celebration-animation';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSwapIntents, useSmartMatches } from '@/hooks/useSwapIntents';
import { useDashboardStats } from '@/hooks/useDashboard';
import { CreateSwapIntentModal } from '@/components/CreateSwapIntentModal';
import { MultiHopMatchView } from '@/components/MultiHopMatchView';
import { Zap, Clock, MapPin, Star, Users, ArrowRight, Plus } from 'lucide-react';

interface SmartMatchViewProps {
  userRole: string;
}

export const SmartMatchView: React.FC<SmartMatchViewProps> = ({ userRole }) => {
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null);
  const [searchStatus, setSearchStatus] = useState<"searching" | "matching" | "found" | "no-matches" | "idle">("idle");
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState("");
  const [activeIntentId, setActiveIntentId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Hooks
  const { activeIntents, isLoadingActive } = useSwapIntents();
  const { matches, isLoading: isLoadingMatches, findMatches, isSearching } = useSmartMatches(activeIntentId);
  const { dashboardStats, isLoading: isLoadingDashboard } = useDashboardStats();
  const analytics = useAnalytics();
  const trackMatchAccepted = analytics?.trackMatchAccepted || ((data: Record<string, unknown>) => console.log('Match accepted:', data));
  const trackSearchPerformed = analytics?.trackSearchPerformed || ((data: Record<string, unknown>) => console.log('Search performed:', data));

  // Set the first active intent as default when intents load
  useEffect(() => {
    if (activeIntents.length > 0 && !activeIntentId) {
      setActiveIntentId(activeIntents[0]._id);
    }
  }, [activeIntents, activeIntentId]);

  // Update search status based on matches
  useEffect(() => {
    if (isSearching) {
      // Don't change status while searching
      return;
    }

    if (matches.length > 0) {
      setSearchStatus("found");
    } else if (activeIntentId && !isLoadingMatches) {
      // Check if we just completed a search (status was searching/matching)
      if (searchStatus === "searching" || searchStatus === "matching") {
        setSearchStatus("no-matches");
      } else if (searchStatus === "idle") {
        // Keep idle status if we haven't searched yet
        setSearchStatus("idle");
      }
    }
  }, [matches, activeIntentId, isLoadingMatches, isSearching, searchStatus]);

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

  // Timer for search elapsed time
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isSearching) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setTimeElapsed(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isSearching]);

  // Handle match connection with celebration
  const handleConnect = async (matchId: string, targetIntentId: string) => {
    try {
      const match = matches.find(m => m.id === matchId);
      if (match) {
        trackMatchAccepted({
          matchId: match.id,
          requesterIntentId: match.requesterIntentId,
          targetIntentId: match.targetIntentId,
          matchScore: match.matchScore,
          compatibility: match.compatibility
        });

        // Here you would implement the actual connection logic
        // For now, we'll show a success message
        setCelebrationMessage(`Successfully connected with match!`);
        setShowCelebration(true);
      }
    } catch (error) {
      console.error('Error connecting match:', error);
    }
  };

  // Perform new search
  const handleNewSearch = async () => {
    if (!activeIntentId) {
      return;
    }

    setSearchStatus("searching");
    setTimeElapsed(0);

    // Track search event
    trackSearchPerformed({
      userRole,
      resultsCount: matches.length,
      timestamp: new Date().toISOString(),
    });

    // Simulate search phases for UX
    setTimeout(() => setSearchStatus("matching"), 1000);

    // Perform actual search
    findMatches(activeIntentId);

    // Wait for search to complete, then update status based on results
    setTimeout(() => {
      // The useEffect will handle setting the correct status based on matches.length
      // This timeout just ensures the search animation completes
    }, 2000);
  };

  // Show loading state
  if (isLoadingActive) {
    return (
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        <SmartMatchHeaderSkeleton />
        <SmartMatchSkeleton count={3} />
      </div>
    );
  }

  // Show no intents state
  if (activeIntents.length === 0) {
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

        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <Plus className="h-16 w-16 text-gray-400" />
              <h3 className="text-xl font-semibold text-gray-900">No Active Swap Intents</h3>
              <p className="text-gray-600 max-w-md">
                Create a swap intent to start finding intelligent matches for your shifts.
              </p>
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => setShowCreateModal(true)}
              >
                Create Swap Intent
              </Button>
            </div>
          </CardContent>
        </Card>

        <CreateSwapIntentModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Celebration Animation */}
      <MatchCelebration
        isVisible={showCelebration}
        onComplete={() => setShowCelebration(false)}
        message={celebrationMessage}
      />

      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
          <Zap className="h-8 w-8 text-blue-600" />
          <span>SmartSwap Matchmaking</span>
        </h2>
        <p className="text-gray-600">
          AI-powered shift matching finds the perfect swap partners based on skills, preferences, and availability.
        </p>

        {/* Intent Selection and Search */}
        <div className="mt-4 flex items-center space-x-4">
          {activeIntents.length > 1 && (
            <select
              value={activeIntentId || ''}
              onChange={(e) => setActiveIntentId(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {activeIntents.map((intent) => (
                <option key={intent._id} value={intent._id}>
                  Intent #{intent._id.slice(-6)} - Priority {intent.priority}
                </option>
              ))}
            </select>
          )}
          <Button
            onClick={handleNewSearch}
            disabled={isSearching || !activeIntentId}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSearching ? "Searching..." : "Find New Matches"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowCreateModal(true)}
            className="border-blue-600 text-blue-600 hover:bg-blue-50"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Intent
          </Button>
        </div>
      </div>

      {/* Live Tracking Indicator */}
      {(isSearching || searchStatus !== "idle") && (
        <LiveTrackingIndicator
          isActive={isSearching}
          status={searchStatus}
          matchCount={matches.length}
          timeElapsed={timeElapsed}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Active Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDashboard ? '...' : dashboardStats?.activeRequests || 0}
            </div>
            <p className="text-blue-100">
              {isLoadingDashboard ? 'Loading...' :
                dashboardStats?.trends.activeRequestsChange !== undefined ?
                  `${dashboardStats.trends.activeRequestsChange >= 0 ? '+' : ''}${dashboardStats.trends.activeRequestsChange} from yesterday` :
                  'No change data'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">Successful Matches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDashboard ? '...' : dashboardStats?.successfulMatches || 0}
            </div>
            <p className="text-green-100">
              {isLoadingDashboard ? 'Loading...' :
                dashboardStats?.trends.successfulMatchesChange !== undefined ?
                  `${dashboardStats.trends.successfulMatchesChange >= 0 ? '+' : ''}${dashboardStats.trends.successfulMatchesChange} this week` :
                  'No change data'
              }
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-white">AI Confidence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {isLoadingDashboard ? '...' : `${dashboardStats?.aiConfidence || 0}%`}
            </div>
            <p className="text-purple-100">
              {isLoadingDashboard ? 'Loading...' :
                dashboardStats?.trends.aiConfidenceChange !== undefined ?
                  `${dashboardStats.trends.aiConfidenceChange >= 0 ? '+' : ''}${dashboardStats.trends.aiConfidenceChange}% trend` :
                  'Stable performance'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Multi-hop Match View */}
      {activeIntentId && activeIntents.find(intent => intent._id === activeIntentId) && (
        <MultiHopMatchView
          intent={activeIntents.find(intent => intent._id === activeIntentId)!}
          directMatches={matches}
          onSelectMatch={(match) => handleConnect(match.id, match.targetIntentId)}
        />
      )}

      {/* Create Swap Intent Modal */}
      <CreateSwapIntentModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
    </div>
  );
};
