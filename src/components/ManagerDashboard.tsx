import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ArrowLeftRight, ClipboardCheck, TrendingUp, BarChart3, Settings, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useSwapChains, useChainApprovals } from '@/hooks/useSwapChains';
import { swapIntentApi } from '@/services/api';

interface ManagerDashboardProps {
  onNavigate?: (view: string) => void;
}

export const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ onNavigate }) => {
  const { userProfile } = useAuth();
  const { users } = useUsers();
  const { dashboardStats } = useDashboardStats();
  const { analytics } = useAnalytics();
  const { activeChains } = useSwapChains();
  const { pendingApprovals, approveChain, rejectChain, totalPending, isApproving, isRejecting } = useChainApprovals();

  const { data: activeIntents = [] } = useQuery({
    queryKey: ['activeSwapIntents'],
    queryFn: async () => {
      const res = await swapIntentApi.getActiveSwapIntents();
      return res.data || [];
    },
  });

  const timeOfDay = new Date().getHours();
  const greeting = timeOfDay < 12 ? 'Good morning' : timeOfDay < 17 ? 'Good afternoon' : 'Good evening';

  const kpis = [
    { label: 'Team Members', value: users?.length ?? 0, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Swap Requests', value: activeIntents.length, icon: ArrowLeftRight, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Pending Approvals', value: totalPending ?? 0, icon: ClipboardCheck, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Swap Success Rate', value: `${analytics?.systemMetrics?.swapSuccessRate ?? dashboardStats?.aiConfidence ?? 0}%`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
  ];

  const approvalQueue = (pendingApprovals && pendingApprovals.length > 0 ? pendingApprovals : activeChains) || [];
  const skills = analytics?.skillDistribution || [];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-1">
          {greeting}, {userProfile?.first_name}! 👋
        </h2>
        <p className="text-gray-600">
          Team overview — monitor swap activity, approve chains, and keep shifts covered.
        </p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <Card key={kpi.label}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">{kpi.label}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">{kpi.value}</p>
                  </div>
                  <div className={`rounded-lg p-3 ${kpi.bg}`}>
                    <Icon className={`h-6 w-6 ${kpi.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Approvals queue */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-amber-600" />
              Approvals Queue
            </CardTitle>
            <CardDescription>Swap chains awaiting a management decision</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {approvalQueue.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-10 w-10 text-green-500 mx-auto mb-2" />
                <p>All caught up — no chains awaiting approval.</p>
              </div>
            ) : (
              approvalQueue.slice(0, 5).map((chain: any) => (
                <div key={chain.chainId || chain._id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-gray-900">
                      Chain {(chain.chainId || chain._id || '').toString().slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {chain.participants?.length ?? 0} participants · {chain.status}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isApproving}
                      onClick={() => approveChain({ chainId: chain.chainId, reason: 'Approved by manager' })}
                    >
                      <CheckCircle className="h-4 w-4 mr-1 text-green-600" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={isRejecting}
                      onClick={() => rejectChain({ chainId: chain.chainId, reason: 'Rejected by manager' })}
                    >
                      <XCircle className="h-4 w-4 mr-1 text-red-600" /> Reject
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Team skill coverage + quick links */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-blue-600" />
                Team Skill Coverage
              </CardTitle>
            </CardHeader>
            <CardContent>
              {skills.length === 0 ? (
                <p className="text-sm text-gray-500">No skill data yet.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {skills.map((s: any) => (
                    <Badge key={s.name ?? s._id} variant="secondary">
                      {(s.name ?? s._id) || 'Skill'}: {s.value ?? s.count ?? 0}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('analytics')}>
                <BarChart3 className="h-4 w-4 mr-2 text-purple-600" /> Open Analytics
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => onNavigate?.('admin')}>
                <Settings className="h-4 w-4 mr-2 text-blue-600" /> Manage Team
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
