import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Users,
  BarChart3,
  Zap,
  Settings,
  Shield,
  UserCheck,
  Clock,
  TrendingUp
} from 'lucide-react';

interface NavigationItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  href: string;
  requiredRoles: string[];
  badge?: string;
  description?: string;
}

const navigationItems: NavigationItem[] = [
  {
    id: 'schedule',
    label: 'My Schedule',
    icon: <Calendar className="h-4 w-4" />,
    href: '/schedule',
    requiredRoles: ['Employee', 'Manager', 'WorkFlowManagement', 'Developer'],
    description: 'View and manage your shifts'
  },
  {
    id: 'smart-swap',
    label: 'Smart Swap',
    icon: <Zap className="h-4 w-4" />,
    href: '/smart-swap',
    requiredRoles: ['Employee', 'Manager', 'WorkFlowManagement', 'Developer'],
    badge: 'AI',
    description: 'Intelligent shift matching'
  },
  {
    id: 'swap-requests',
    label: 'Swap Requests',
    icon: <Clock className="h-4 w-4" />,
    href: '/swap-requests',
    requiredRoles: ['Employee', 'Manager', 'WorkFlowManagement', 'Developer'],
    description: 'Manage swap requests'
  },
  {
    id: 'team-management',
    label: 'Team Management',
    icon: <Users className="h-4 w-4" />,
    href: '/team',
    requiredRoles: ['Manager', 'WorkFlowManagement', 'Developer'],
    description: 'Manage team schedules'
  },
  {
    id: 'user-management',
    label: 'User Management',
    icon: <UserCheck className="h-4 w-4" />,
    href: '/users',
    requiredRoles: ['WorkFlowManagement', 'Developer'],
    description: 'Manage system users'
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: <BarChart3 className="h-4 w-4" />,
    href: '/analytics',
    requiredRoles: ['Manager', 'WorkFlowManagement', 'Developer'],
    description: 'System insights and reports'
  },
  {
    id: 'workflow-settings',
    label: 'Workflow Settings',
    icon: <Settings className="h-4 w-4" />,
    href: '/workflow-settings',
    requiredRoles: ['WorkFlowManagement', 'Developer'],
    description: 'Configure system workflows'
  },
  {
    id: 'system-admin',
    label: 'System Administration',
    icon: <Shield className="h-4 w-4" />,
    href: '/admin',
    requiredRoles: ['Developer'],
    description: 'System configuration'
  }
];

interface RoleBasedNavigationProps {
  currentPath?: string;
  onNavigate?: (href: string) => void;
  variant?: 'sidebar' | 'horizontal' | 'compact';
}

export const RoleBasedNavigation: React.FC<RoleBasedNavigationProps> = ({
  currentPath = '',
  onNavigate,
  variant = 'sidebar'
}) => {
  const { user, hasRole } = useAuth();

  if (!user) return null;

  // Filter navigation items based on user role
  const allowedItems = navigationItems.filter(item =>
    item.requiredRoles.some(role => hasRole(role))
  );

  const handleNavigation = (href: string) => {
    if (onNavigate) {
      onNavigate(href);
    } else {
      // Default navigation behavior
      window.location.href = href;
    }
  };

  if (variant === 'horizontal') {
    return (
      <nav className="flex space-x-1 overflow-x-auto">
        {allowedItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPath === item.href ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleNavigation(item.href)}
            className="flex items-center space-x-2 whitespace-nowrap"
          >
            {item.icon}
            <span>{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-1 text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
    );
  }

  if (variant === 'compact') {
    return (
      <nav className="space-y-1">
        {allowedItems.map((item) => (
          <Button
            key={item.id}
            variant={currentPath === item.href ? 'default' : 'ghost'}
            size="sm"
            onClick={() => handleNavigation(item.href)}
            className="w-full justify-start"
          >
            {item.icon}
            <span className="ml-2">{item.label}</span>
            {item.badge && (
              <Badge variant="secondary" className="ml-auto text-xs">
                {item.badge}
              </Badge>
            )}
          </Button>
        ))}
      </nav>
    );
  }

  // Default sidebar variant
  return (
    <nav className="space-y-2">
      {allowedItems.map((item) => (
        <div key={item.id}>
          <Button
            variant={currentPath === item.href ? 'default' : 'ghost'}
            onClick={() => handleNavigation(item.href)}
            className="w-full justify-start h-auto p-3"
          >
            <div className="flex items-center space-x-3 w-full">
              <div className="flex-shrink-0">
                {item.icon}
              </div>
              <div className="flex-1 text-left">
                <div className="flex items-center space-x-2">
                  <span className="font-medium">{item.label}</span>
                  {item.badge && (
                    <Badge variant="secondary" className="text-xs">
                      {item.badge}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                )}
              </div>
            </div>
          </Button>
        </div>
      ))}
    </nav>
  );
};

// Role-specific navigation shortcuts
export const EmployeeNavigation: React.FC<RoleBasedNavigationProps> = (props) => {
  const { hasRole } = useAuth();

  if (!hasRole('Employee')) return null;

  return <RoleBasedNavigation {...props} />;
};

export const ManagerNavigation: React.FC<RoleBasedNavigationProps> = (props) => {
  const { hasRole } = useAuth();

  if (!hasRole(['Manager', 'WorkFlowManagement', 'Developer'])) return null;

  return <RoleBasedNavigation {...props} />;
};

export const WorkFlowManagementNavigation: React.FC<RoleBasedNavigationProps> = (props) => {
  const { hasRole } = useAuth();

  if (!hasRole(['WorkFlowManagement', 'Developer'])) return null;

  return <RoleBasedNavigation {...props} />;
};

// Quick access component for role-specific features
export const RoleQuickAccess: React.FC = () => {
  const { user, hasRole } = useAuth();

  if (!user) return null;

  const getQuickAccessItems = () => {
    const items = [];

    if (hasRole('Employee')) {
      items.push({
        label: 'Find Swaps',
        icon: <Zap className="h-4 w-4" />,
        href: '/smart-swap',
        color: 'bg-blue-500'
      });
    }

    if (hasRole(['Manager', 'WorkFlowManagement', 'Developer'])) {
      items.push({
        label: 'Team Overview',
        icon: <Users className="h-4 w-4" />,
        href: '/team',
        color: 'bg-green-500'
      });
    }

    if (hasRole(['WorkFlowManagement', 'Developer'])) {
      items.push({
        label: 'System Analytics',
        icon: <TrendingUp className="h-4 w-4" />,
        href: '/analytics',
        color: 'bg-purple-500'
      });
    }

    return items;
  };

  const quickAccessItems = getQuickAccessItems();

  if (quickAccessItems.length === 0) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickAccessItems.map((item, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-20 flex flex-col items-center justify-center space-y-2"
          onClick={() => window.location.href = item.href}
        >
          <div className={`p-2 rounded-lg ${item.color} text-white`}>
            {item.icon}
          </div>
          <span className="text-sm font-medium">{item.label}</span>
        </Button>
      ))}
    </div>
  );
};
