
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { ScheduleView } from '@/components/ScheduleView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { AdminPanel } from '@/components/AdminPanel';
import { SmartMatchView } from '@/components/SmartMatchView';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [userRole, setUserRole] = useState('Employee'); // Employee, Admin, Manager, Developer

  const renderActiveView = () => {
    switch (activeView) {
      case 'dashboard':
        return <Dashboard userRole={userRole} />;
      case 'schedule':
        return <ScheduleView userRole={userRole} />;
      case 'smartmatch':
        return <SmartMatchView userRole={userRole} />;
      case 'analytics':
        return <AnalyticsView userRole={userRole} />;
      case 'admin':
        return <AdminPanel userRole={userRole} />;
      default:
        return <Dashboard userRole={userRole} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navigation 
        activeView={activeView} 
        setActiveView={setActiveView}
        userRole={userRole}
        setUserRole={setUserRole}
      />
      <main className="transition-all duration-300 ease-in-out">
        {renderActiveView()}
      </main>
    </div>
  );
};

export default Index;
