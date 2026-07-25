
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Shield, AlertTriangle, CheckCircle, Activity } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useUsers } from '@/hooks/useUsers';
import { useDashboardStats } from '@/hooks/useDashboard';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AdminPanelProps {
  userRole: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userRole }) => {
  const [activeOperations, setActiveOperations] = useState<string[]>([]);

  // Real data hooks
  const { users, isLoading: isLoadingUsers, getUserStats, updateUser, deleteUser, isUpdating, isDeleting } = useUsers();
  const { dashboardStats, isLoading: isLoadingDashboard } = useDashboardStats();
  const { analytics, isLoading: isLoadingAnalytics } = useAnalytics();

  // Get real system metrics from analytics and dashboard
  const systemMetrics = [
    {
      name: 'Total Users',
      value: isLoadingUsers ? '...' : users.length.toString(),
      status: 'healthy'
    },
    {
      name: 'Active Requests',
      value: isLoadingDashboard ? '...' : (dashboardStats?.activeRequests?.toString() || '0'),
      status: 'healthy'
    },
    {
      name: 'AI Confidence',
      value: isLoadingDashboard ? '...' : `${dashboardStats?.aiConfidence || 0}%`,
      status: dashboardStats?.aiConfidence && dashboardStats.aiConfidence > 80 ? 'healthy' : 'warning'
    },
    {
      name: 'Success Rate',
      value: isLoadingAnalytics ? '...' : `${analytics?.systemMetrics?.swapSuccessRate?.toFixed(1) || 0}%`,
      status: analytics?.systemMetrics?.swapSuccessRate && analytics.systemMetrics.swapSuccessRate > 75 ? 'healthy' : 'warning'
    },
  ];

  // Helper function to get user status
  const getUserStatus = (user: any) => {
    const lastUpdate = new Date(user.updatedAt);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    return lastUpdate >= thirtyDaysAgo ? 'Active' : 'Inactive';
  };

  // Helper function to format last login
  const getLastLogin = (user: any) => {
    const lastUpdate = new Date(user.updatedAt);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Less than 1 hour ago';
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  };

  const handleOperation = (operation: string) => {
    setActiveOperations([...activeOperations, operation]);
    setTimeout(() => {
      setActiveOperations(prev => prev.filter(op => op !== operation));
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-muted text-foreground';
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'bg-muted text-foreground';
    }
  };

  if (userRole !== 'Manager' && userRole !== 'WorkFlowManagement' && userRole !== 'Developer') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <Shield className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Access Restricted</h3>
            <p className="text-muted-foreground">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <span>Team Management</span>
        </h2>
        <p className="text-muted-foreground">
          Manage your team, monitor coverage, and review swap activity across SmartSwap.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className={`grid w-full ${(userRole === 'WorkFlowManagement' || userRole === 'Developer') ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          {(userRole === 'WorkFlowManagement' || userRole === 'Developer') && (
            <TabsTrigger value="developer">Developer Tools</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Total Users</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingUsers ? '...' : users.length}
                </div>
                <p className="text-blue-100">
                  {getUserStats ? `${getUserStats.activeUsers} active` : 'Real user data'}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>System Health</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingDashboard ? '...' : `${dashboardStats?.aiConfidence || 0}%`}
                </div>
                <p className="text-green-100">AI Confidence Level</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Active Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingDashboard ? '...' : (dashboardStats?.activeRequests || 0)}
                </div>
                <p className="text-purple-100">Active Swap Requests</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Team Composition</CardTitle>
              <CardDescription>Your team members by role</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {['Employee', 'Manager', 'WorkFlowManagement', 'Developer'].map((role) => {
                  const count = (users || []).filter((u) => u.role === role).length;
                  if (count === 0) return null;
                  return (
                    <div key={role} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <span className="text-sm text-foreground">{role}</span>
                      <span className="text-sm font-semibold text-foreground">{count}</span>
                    </div>
                  );
                })}
                {(!users || users.length === 0) && (
                  <p className="text-sm text-muted-foreground">No team members yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts, roles, and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {isLoadingUsers ? (
                  <div className="text-center py-8 text-muted-foreground">Loading users...</div>
                ) : users.length > 0 ? (
                  users.slice(0, 10).map((user) => (
                    <div key={user._id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">
                            {user.firstName} {user.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {user.email} • Last activity: {getLastLogin(user)}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Badge variant="outline">{user.role}</Badge>
                        <Badge variant="outline">{user.marketplace}</Badge>
                        <Badge className={getStatusColor(getUserStatus(user))}>
                          {getUserStatus(user)}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={isUpdating || isDeleting}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No users found</div>
                )}
                {users.length > 10 && (
                  <div className="text-center pt-4">
                    <p className="text-sm text-muted-foreground">
                      Showing 10 of {users.length} users
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Health Monitoring</CardTitle>
              <CardDescription>Real-time system performance and health metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {systemMetrics.map((metric, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-foreground">{metric.name}</span>
                      <span className={`font-bold ${getStatusColor(metric.status)}`}>
                        {metric.value}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {metric.status === 'healthy' ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                      <span className={`text-sm ${getStatusColor(metric.status)}`}>
                        {metric.status === 'healthy' ? 'Optimal' : 'Needs attention'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="developer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Developer Actions</CardTitle>
              <CardDescription>Database operations and development utilities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'Seed Mock Data', action: 'seed', description: 'Generate test users and schedules' },
                  { label: 'Reset Database', action: 'reset', description: 'Clear all data (use with caution)' },
                  { label: 'Run Migrations', action: 'migrate', description: 'Update database schema' },
                  { label: 'Generate Reports', action: 'report', description: 'Export system analytics' },
                  { label: 'Backup Database', action: 'backup', description: 'Create data backup' },
                  { label: 'Test Connections', action: 'test', description: 'Verify system connectivity' },
                ].map((item, index) => (
                  <div key={index} className="p-4 border rounded-lg space-y-3">
                    <div>
                      <h4 className="font-medium text-foreground">{item.label}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Button
                      size="sm"
                      onClick={() => handleOperation(item.action)}
                      disabled={activeOperations.includes(item.action)}
                      className="w-full"
                    >
                      {activeOperations.includes(item.action) ? 'Running...' : 'Execute'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
