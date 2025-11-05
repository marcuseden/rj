'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase';

interface AuthWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Authentication Wrapper Component
 *
 * Ensures user is authenticated before rendering children.
 * Redirects to login page if not authenticated.
 */
export function AuthWrapper({ children, fallback }: AuthWrapperProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (error || !user) {
          // User is not authenticated, redirect to login
          const currentPath = window.location.pathname;
          const loginUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;
          router.push(loginUrl);
          setIsAuthenticated(false);
        } else {
          // User is authenticated
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setIsAuthenticated(false);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setIsAuthenticated(false);
        router.push('/login');
      } else if (event === 'SIGNED_IN' && session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Show loading state while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto"></div>
          <p className="mt-4 text-stone-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Show nothing or redirect if not authenticated (redirect is handled in useEffect)
  if (!isAuthenticated) {
    return null;
  }

  // User is authenticated, render children
  return <>{children}</>;
}

/**
 * Higher-Order Component for protecting pages with authentication
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthWrapper fallback={fallback}>
        <Component {...props} />
      </AuthWrapper>
    );
  };
}

