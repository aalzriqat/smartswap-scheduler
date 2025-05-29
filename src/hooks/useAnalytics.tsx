
import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/services/api';
import { useCallback } from 'react';

// Analytics event types for type safety
export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp?: Date;
}

// Production-ready analytics tracking
export const useAnalytics = (userId?: string) => {
  // Get general analytics with error handling
  const { data: analytics, isLoading, error } = useQuery({
    queryKey: ['analytics'],
    queryFn: async () => {
      const response = await analyticsApi.getAnalytics();
      return response.data;
    },
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false, // Don't refetch when window gains focus
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get user-specific analytics with error handling
  const { data: userAnalytics, isLoading: isLoadingUserAnalytics, error: userAnalyticsError } = useQuery({
    queryKey: ['analytics', 'user', userId],
    queryFn: async () => {
      if (!userId) return null;
      const response = await analyticsApi.getUserAnalytics(userId);
      return response.data;
    },
    enabled: !!userId,
    retry: 1,
    refetchOnWindowFocus: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Track events for production analytics
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        referrer: document.referrer,
      },
      userId,
      timestamp: new Date(),
    };

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('📊 Analytics Event:', analyticsEvent);
    }

    // In production, send to analytics service
    try {
      // Example: Send to your analytics endpoint
      // fetch('/api/analytics/track', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(analyticsEvent)
      // });

      // Example: Send to Google Analytics 4
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', event, properties);
      }

      // Example: Send to PostHog
      if (typeof window !== 'undefined' && (window as any).posthog) {
        (window as any).posthog.capture(event, properties);
      }
    } catch (error) {
      console.error('Failed to track analytics event:', error);
    }
  }, [userId]);

  // Pre-defined tracking functions for common events
  const trackSwapIntent = useCallback((swapData: Record<string, unknown>) => {
    track('swap_intent_created', {
      originalShift: swapData.originalShift,
      wantedShift: swapData.wantedShift,
      skills: swapData.skills,
      marketplace: swapData.marketplace,
    });
  }, [track]);

  const trackMatchAccepted = useCallback((matchData: Record<string, unknown>) => {
    track('smart_match_accepted', {
      matchScore: matchData.matchScore,
      matchId: matchData.id,
      employee: matchData.employee,
      compatibility: matchData.compatibility,
    });
  }, [track]);

  const trackMatchRejected = useCallback((matchData: Record<string, unknown>, reason?: string) => {
    track('smart_match_rejected', {
      matchScore: matchData.matchScore,
      matchId: matchData.id,
      employee: matchData.employee,
      compatibility: matchData.compatibility,
      rejectionReason: reason,
    });
  }, [track]);

  const trackScheduleViewed = useCallback((viewType: string) => {
    track('schedule_viewed', {
      viewType,
      timestamp: new Date().toISOString(),
    });
  }, [track]);

  const trackFeedbackSubmitted = useCallback((feedback: Record<string, unknown>) => {
    track('feedback_submitted', {
      type: feedback.type,
      rating: feedback.rating,
      hasMessage: !!feedback.message,
      messageLength: (feedback.message as string)?.length || 0,
    });
  }, [track]);

  const trackSearchPerformed = useCallback((searchParams: Record<string, unknown>) => {
    track('search_performed', {
      searchType: 'smart_match',
      filters: searchParams,
      resultsCount: searchParams.resultsCount,
    });
  }, [track]);

  return {
    analytics,
    userAnalytics,
    isLoading,
    isLoadingUserAnalytics,
    error,
    userAnalyticsError,
    // Tracking functions
    track,
    trackSwapIntent,
    trackMatchAccepted,
    trackMatchRejected,
    trackScheduleViewed,
    trackFeedbackSubmitted,
    trackSearchPerformed,
  };
};
