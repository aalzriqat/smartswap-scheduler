
import React from 'react';
import { Calendar, BarChart3, Users, Settings, Zap, Shield, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/components/auth/UserProfile';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationProps {
  activeView: string;
  setActiveView: (view: string) => void;
  userRole: string;
  setUserRole: (role: string) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeView,
  setActiveView,
  userRole,
  setUserRole
}) => {
  const isMobile = useIsMobile();
  const navItems = [
    // Personal shift-swapping tools — employees only. Managers oversee, they don't swap.
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3, roles: ['Employee', 'WorkFlowManagement', 'Manager', 'Developer'] },
    { id: 'schedule', label: 'My Schedule', icon: Calendar, roles: ['Employee'] },
    { id: 'smartmatch', label: 'SmartSwap', icon: Zap, roles: ['Employee'] },
    // Management tools — managers and above.
    { id: 'analytics', label: 'Analytics', icon: BarChart3, roles: ['WorkFlowManagement', 'Manager', 'Developer'] },
    { id: 'admin', label: 'Team', icon: Settings, roles: ['WorkFlowManagement', 'Manager', 'Developer'] },
  ];

  const filteredNavItems = navItems.filter(item => item.roles.includes(userRole));

  return (
    <nav className="bg-card shadow-lg border-b border-blue-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-2 rounded-lg">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                SmartSwap
              </h1>
            </div>

            {/* Desktop Navigation - Hidden on mobile since we have bottom nav */}
            <div className="hidden md:flex space-x-1">
              {filteredNavItems.map(item => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeView === item.id ? "default" : "ghost"}
                    onClick={() => setActiveView(item.id)}
                    className={`flex items-center space-x-2 ${
                      activeView === item.id
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'text-muted-foreground hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <UserProfile />
          </div>
        </div>
      </div>
    </nav>
  );
};
