
import React, { useState } from 'react';
import { Navigation } from '@/components/Navigation';
import { Dashboard } from '@/components/Dashboard';
import { ScheduleView } from '@/components/ScheduleView';
import { AnalyticsView } from '@/components/AnalyticsView';
import { AdminPanel } from '@/components/AdminPanel';
import { SmartMatchView } from '@/components/SmartMatchView';
import { MobileBottomNav } from '@/components/ui/mobile-bottom-nav';
import { MobileFeedbackButton } from '@/components/ui/mobile-feedback-button';
import { ErrorBoundary } from '@/components/ui/error-boundary';
import { UserProfile } from '@/components/auth/UserProfile';
import { RoleBasedNavigation } from '@/components/navigation/RoleBasedNavigation';
import { useIsMobile } from '@/hooks/use-mobile';
import { useAnalytics } from '@/hooks/useAnalytics';
import { useAuth } from '@/contexts/AuthContext';

const Index = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const { user } = useAuth();
  const isMobile = useIsMobile();

  // Analytics with error handling
  const analytics = useAnalytics();
  const trackFeedbackSubmitted = analytics?.trackFeedbackSubmitted || ((feedback: any) => console.log('Feedback:', feedback));
  const track = analytics?.track || ((event: string, data: any) => console.log('Track:', event, data));

  const handleFeedbackSubmit = async (feedback: { message: string; rating: number; type: string }) => {
    // Track feedback submission
    trackFeedbackSubmitted(feedback);

    // Here you would typically send the feedback to your backend
    console.log('Feedback submitted:', feedback);

    // In production, send to backend
    try {
      // await fetch('/api/feedback', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(feedback)
      // });
    } catch (error) {
      console.error('Failed to submit feedback:', error);
    }
  };

  const handleViewChange = (view: string) => {
    track('navigation_change', {
      from: activeView,
      to: view,
      userRole: user?.role,
      isMobile
    });
    setActiveView(view);
  };

  const renderActiveView = () => {
    const userRole = user?.role || 'Employee';

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
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <Navigation
          activeView={activeView}
          setActiveView={handleViewChange}
          userRole={user?.role || 'Employee'}
          setUserRole={() => {}} // Remove role switching since it's now from auth
        />
        <main className={`transition-all duration-300 ease-in-out ${isMobile ? 'pb-20' : ''}`}>
          {renderActiveView()}
        </main>

        {/* Mobile-only components */}
        {isMobile && (
          <>
            <MobileBottomNav
              activeView={activeView}
              onViewChange={handleViewChange}
              userRole={user?.role || 'Employee'}
            />
            <MobileFeedbackButton onSubmit={handleFeedbackSubmit} />
          </>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default Index;
