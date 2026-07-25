import { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { Dashboard } from '@/components/Dashboard';
import { ManagerDashboard } from '@/components/ManagerDashboard';
import { TeamView } from '@/components/TeamView';
import { ScheduleView } from '@/components/ScheduleView';
import { SmartMatchView } from '@/components/SmartMatchView';
import { MultiHopMatchView } from '@/components/MultiHopMatchView';
import { ChainManagementView } from '@/components/ChainManagementView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { AdminPanel } from '@/components/AdminPanel';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { user } = useAuth();

  const role = user?.role || 'Employee';
  const isManager = ['Manager', 'WorkFlowManagement', 'Developer'].includes(role);

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return isManager
          ? <ManagerDashboard onNavigate={setActiveView} />
          : <Dashboard onNavigate={setActiveView} />;
      case 'schedule':
        return <ScheduleView />;
      case 'smartmatch':
        return <SmartMatchView />;
      case 'multihop':
        return <MultiHopMatchView />;
      case 'chains':
        return <ChainManagementView />;
      case 'analytics':
        return <AnalyticsView />;
      case 'team':
        return role === 'Developer' ? <AdminPanel userRole={role} /> : <TeamView />;
      default:
        return isManager
          ? <ManagerDashboard onNavigate={setActiveView} />
          : <Dashboard onNavigate={setActiveView} />;
    }
  };

  return (
    <ErrorBoundary>
      <AppShell activeView={activeView} onNavigate={setActiveView}>
        {renderActiveView()}
      </AppShell>
    </ErrorBoundary>
  );
};

export default Index;
