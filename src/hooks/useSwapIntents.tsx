import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { SwapIntent, UserPreferences } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useSwapIntents = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user's swap intents
  const {
    data: swapIntents = [],
    isLoading,
    error
  } = useQuery({
    queryKey: ['swapIntents', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return [];
      
      const { data, error } = await supabase
        .from('swap_intents')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as SwapIntent[];
    },
    enabled: !!userProfile?.id,
  });

  // Create a new swap intent
  const createSwapIntentMutation = useMutation({
    mutationFn: async (newIntent: Omit<SwapIntent, '_id' | 'createdAt' | 'updatedAt'>) => {
      const { data, error } = await supabase
        .from('swap_intents')
        .insert([newIntent])
        .select()
        .single();
      
      if (error) {
        console.error('Error creating swap intent:', error);
        throw error;
      }
      return data as SwapIntent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({
        title: 'Swap intent created',
        description: 'Your swap intent has been successfully created.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error creating swap intent',
        description: error.message || 'An error occurred while creating the swap intent.',
        variant: 'destructive',
      });
    },
  });

  // Update an existing swap intent
  const updateSwapIntentMutation = useMutation({
    mutationFn: async (updatedIntent: SwapIntent) => {
      const { data, error } = await supabase
        .from('swap_intents')
        .update(updatedIntent)
        .eq('id', updatedIntent.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating swap intent:', error);
        throw error;
      }
      return data as SwapIntent;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({
        title: 'Swap intent updated',
        description: 'Your swap intent has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating swap intent',
        description: error.message || 'An error occurred while updating the swap intent.',
        variant: 'destructive',
      });
    },
  });

  // Delete a swap intent
  const deleteSwapIntentMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase
        .from('swap_intents')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting swap intent:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['swapIntents', userProfile?.id]);
      toast({
        title: 'Swap intent deleted',
        description: 'Your swap intent has been successfully deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error deleting swap intent',
        description: error.message || 'An error occurred while deleting the swap intent.',
        variant: 'destructive',
      });
    },
  });

  return {
    swapIntents,
    isLoading,
    error,
    createSwapIntent: createSwapIntentMutation.mutateAsync,
    updateSwapIntent: updateSwapIntentMutation.mutateAsync,
    deleteSwapIntent: deleteSwapIntentMutation.mutateAsync,
    isCreating: createSwapIntentMutation.isLoading,
    isUpdating: updateSwapIntentMutation.isLoading,
    isDeleting: deleteSwapIntentMutation.isLoading,
  };
};

export const useUserPreferences = () => {
  const { user, userProfile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user preferences
  const {
    data: preferences = null,
    isLoading: isLoadingPreferences,
    error: preferencesError
  } = useQuery({
    queryKey: ['userPreferences', userProfile?.id],
    queryFn: async () => {
      if (!userProfile?.id) return null;
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', userProfile.id)
        .single();
      
      if (error) {
        console.error('Error fetching user preferences:', error);
        return null;
      }
      return data as UserPreferences;
    },
    enabled: !!userProfile?.id,
  });

  // Create user preferences if they don't exist
  useEffect(() => {
    if (userProfile?.id && !preferences && !isLoadingPreferences && !preferencesError) {
      const createUserPreferences = async () => {
        const { data, error } = await supabase
          .from('user_preferences')
          .insert([{ user_id: userProfile.id, autoMatchEnabled: true }])
          .select()
          .single();
        
        if (error) {
          console.error('Error creating user preferences:', error);
          toast({
            title: 'Error creating user preferences',
            description: error.message || 'An error occurred while creating user preferences.',
            variant: 'destructive',
          });
        } else {
          queryClient.invalidateQueries(['userPreferences', userProfile.id]);
        }
      };
      createUserPreferences();
    }
  }, [userProfile, preferences, isLoadingPreferences, preferencesError, queryClient, toast]);

  // Update user preferences
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updatedPreferences: Partial<UserPreferences>) => {
      if (!preferences) {
        throw new Error('User preferences not loaded.');
      }
      
      const { data, error } = await supabase
        .from('user_preferences')
        .update(updatedPreferences)
        .eq('user_id', userProfile?.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating user preferences:', error);
        throw error;
      }
      return data as UserPreferences;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['userPreferences', userProfile?.id]);
      toast({
        title: 'User preferences updated',
        description: 'Your user preferences have been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Error updating user preferences',
        description: error.message || 'An error occurred while updating user preferences.',
        variant: 'destructive',
      });
    },
  });

  return {
    preferences,
    isLoading: isLoadingPreferences,
    error: preferencesError,
    updatePreferences: updatePreferencesMutation.mutateAsync,
    isUpdating: updatePreferencesMutation.isLoading,
  };
};
