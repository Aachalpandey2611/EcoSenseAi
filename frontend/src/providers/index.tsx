import React, { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { Loader2 } from 'lucide-react';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export const AppProviders = ({ children }: { children: React.ReactNode }) => {
  const { isLoading, setLoading, setUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    const initAuth = async () => {
      // If we're authenticated in store (we have tokens), verify with server
      if (isAuthenticated) {
        try {
          const user = await authApi.getMe();
          setUser(user);
        } catch (error) {
          console.error("Auth check failed", error);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [isAuthenticated, setUser, setLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--card)]">
        <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
      </div>
    );
  }

  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
};
