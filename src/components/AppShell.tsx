import React from 'react';
import {
  LayoutDashboard, CalendarDays, Sparkles, Repeat, Link2, Users, BarChart3,
  Sun, Moon, LogOut, ArrowLeftRight,
} from 'lucide-react';
import { useTheme } from '@/hooks/use-theme';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const EMPLOYEE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schedule', label: 'My Schedule', icon: CalendarDays },
  { id: 'smartmatch', label: 'Smart Match', icon: Sparkles },
  { id: 'multihop', label: 'Multi-hop Swaps', icon: Repeat },
  { id: 'chains', label: 'Swap Chains', icon: Link2 },
];

const MANAGER_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
  { id: 'team', label: 'Team Coverage', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
];

interface AppShellProps {
  activeView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ activeView, onNavigate, children }) => {
  const { theme, toggle } = useTheme();
  const { userProfile, logout } = useAuth();
  const isManager = ['Manager', 'WorkFlowManagement', 'Developer'].includes(userProfile?.role || '');
  const nav = isManager ? MANAGER_NAV : EMPLOYEE_NAV;
  const current = nav.find((n) => n.id === activeView) || nav[0];
  const initials = `${userProfile?.first_name?.[0] || ''}${userProfile?.last_name?.[0] || ''}`.toUpperCase();

  return (
    <div className="min-h-screen bg-app">
      {/* Sidebar */}
      <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col bg-sidebar text-sidebar-foreground border-r border-sidebar-border">
        <div className="flex items-center gap-2.5 px-5 h-16 border-b border-sidebar-border">
          <div className="grid place-items-center h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30">
            <ArrowLeftRight className="h-5 w-5 text-white" />
          </div>
          <span className="font-display text-lg font-bold text-white">SmartSwap</span>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-foreground/50">
            {isManager ? 'Management' : 'Workspace'}
          </p>
          {nav.map((item) => {
            const Icon = item.icon;
            const active = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'group relative flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-sidebar-accent text-white'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white'
                )}
              >
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-1 rounded-r-full bg-indigo-400" />}
                <Icon className={cn('h-[18px] w-[18px]', active ? 'text-indigo-300' : 'text-sidebar-foreground/70 group-hover:text-white')} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3 space-y-1">
          <div className="flex items-center gap-3 rounded-lg px-3 py-2">
            <div className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
              {initials || 'U'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">
                {userProfile?.first_name} {userProfile?.last_name}
              </p>
              <p className="truncate text-xs text-sidebar-foreground/60">{userProfile?.role}</p>
            </div>
          </div>
          <button
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent/60 hover:text-white transition-colors"
          >
            <LogOut className="h-[18px] w-[18px]" /> Sign out
          </button>
        </div>
      </aside>

      {/* Content */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 glass border-b border-border">
          <div className="flex h-16 items-center gap-3 px-4 lg:px-8">
            <div className="lg:hidden grid place-items-center h-8 w-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600">
              <ArrowLeftRight className="h-4 w-4 text-white" />
            </div>
            <div>
              <h1 className="font-display text-lg font-semibold leading-none">{current.label}</h1>
              <p className="hidden sm:block text-xs text-muted-foreground mt-0.5">
                {isManager ? 'Team management console' : 'Your shift-swapping workspace'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button
                onClick={toggle}
                aria-label="Toggle theme"
                className="grid place-items-center h-9 w-9 rounded-lg border border-border bg-card hover:bg-accent transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </button>
              <div className="grid place-items-center h-9 w-9 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-bold">
                {initials || 'U'}
              </div>
            </div>
          </div>
        </header>

        <main>{children}</main>
      </div>
    </div>
  );
};
