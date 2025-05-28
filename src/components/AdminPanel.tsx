
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, Database, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface AdminPanelProps {
  userRole: string;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ userRole }) => {
  const [activeOperations, setActiveOperations] = useState<string[]>([]);

  const mockUsers = [
    { id: 1, name: 'Sarah Johnson', role: 'Employee', status: 'Active', lastLogin: '2 hours ago' },
    { id: 2, name: 'Mike Chen', role: 'Manager', status: 'Active', lastLogin: '1 day ago' },
    { id: 3, name: 'Alex Rodriguez', role: 'Employee', status: 'Inactive', lastLogin: '1 week ago' },
    { id: 4, name: 'Emily Davis', role: 'Admin', status: 'Active', lastLogin: '30 minutes ago' },
  ];

  const systemMetrics = [
    { name: 'Database Size', value: '2.4 GB', status: 'healthy' },
    { name: 'Active Connections', value: '247', status: 'healthy' },
    { name: 'Memory Usage', value: '68%', status: 'warning' },
    { name: 'CPU Usage', value: '34%', status: 'healthy' },
  ];

  const handleOperation = (operation: string) => {
    setActiveOperations([...activeOperations, operation]);
    setTimeout(() => {
      setActiveOperations(prev => prev.filter(op => op !== operation));
    }, 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-700';
      case 'Inactive': return 'bg-gray-100 text-gray-700';
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (userRole !== 'Admin' && userRole !== 'Developer') {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <Card className="text-center">
          <CardContent className="p-8">
            <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">You don't have permission to access the admin panel.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center space-x-3">
          <Settings className="h-8 w-8 text-blue-600" />
          <span>Admin Panel</span>
        </h2>
        <p className="text-gray-600">
          System administration, user management, and developer tools for SmartSwap.
        </p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="system">System Health</TabsTrigger>
          <TabsTrigger value="developer">Developer Tools</TabsTrigger>
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
                <div className="text-3xl font-bold">247</div>
                <p className="text-blue-100">+12 this month</p>
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
                <div className="text-3xl font-bold">99.1%</div>
                <p className="text-green-100">All systems operational</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardHeader>
                <CardTitle className="text-white">Active Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">156</div>
                <p className="text-purple-100">Peak: 203 today</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
              <CardDescription>Latest system events and operations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { time: '2 minutes ago', event: 'Database backup completed', type: 'success' },
                  { time: '15 minutes ago', event: 'New user registration: John Smith', type: 'info' },
                  { time: '1 hour ago', event: 'System update deployed successfully', type: 'success' },
                  { time: '2 hours ago', event: 'High memory usage detected', type: 'warning' },
                ].map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.type === 'success' ? 'bg-green-500' :
                        activity.type === 'warning' ? 'bg-yellow-500' :
                        'bg-blue-500'
                      }`}></div>
                      <span className="text-sm text-gray-900">{activity.event}</span>
                    </div>
                    <span className="text-xs text-gray-500">{activity.time}</span>
                  </div>
                ))}
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
                {mockUsers.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">Last login: {user.lastLogin}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">{user.role}</Badge>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status}
                      </Badge>
                      <Button size="sm" variant="outline">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
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
                      <span className="font-medium text-gray-900">{metric.name}</span>
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
                      <h4 className="font-medium text-gray-900">{item.label}</h4>
                      <p className="text-sm text-gray-600">{item.description}</p>
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
