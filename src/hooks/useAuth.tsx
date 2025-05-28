
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/api';
import { User } from '@/types/api';
import { useToast } from '@/hooks/use-toast';

export const useAuth = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get current user
  const { data: currentUser, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authApi.getCurrentUser();
      return response.data;
    },
    enabled: !!localStorage.getItem('authToken'),
    retry: false,
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
    onSuccess: (response) => {
      localStorage.setItem('authToken', response.data.token);
      queryClient.setQueryData(['currentUser'], response.data.user);
      toast({
        title: 'Login successful',
        description: 'Welcome back!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Login failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: (userData: Partial<User>) => authApi.register(userData),
    onSuccess: (response) => {
      localStorage.setItem('authToken', response.data.token);
      queryClient.setQueryData(['currentUser'], response.data.user);
      toast({
        title: 'Registration successful',
        description: 'Welcome to SmartSwap!',
      });
    },
    onError: (error: Error) => {
      toast({
        title: 'Registration failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: () => authApi.logout(),
    onSuccess: () => {
      localStorage.removeItem('authToken');
      queryClient.clear();
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out.',
      });
    },
  });

  return {
    currentUser,
    isLoadingUser,
    login: loginMutation.mutate,
    register: registerMutation.mutate,
    logout: logoutMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    isRegistering: registerMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  };
};
