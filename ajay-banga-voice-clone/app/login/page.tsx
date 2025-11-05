'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter, useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const redirectTo = searchParams.get('redirect') || '/dashboard';

  // Check if user is already authenticated and redirect them
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        router.push(redirectTo);
      }
    };
    checkAuth();
  }, [router, redirectTo, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}${redirectTo}`,
          },
        });
        if (error) throw error;
        alert('Check your email to confirm your account!');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        
        if (error) {
          // Provide user-friendly error messages
          if (error.message.includes('Invalid login credentials')) {
            throw new Error('Invalid email or password. Please try again.');
          } else if (error.message.includes('Email not confirmed')) {
            throw new Error('Please confirm your email address before signing in.');
          } else if (error.message.includes('network') || error.message.includes('fetch')) {
            throw new Error('Connection error. Please check your internet connection and Supabase configuration.');
          } else {
            throw error;
          }
        }
        
        if (data.session) {
          router.push(redirectTo);
          router.refresh();
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white border-stone-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-semibold text-stone-900 mb-2">
            CEO Alignment Checker
          </h1>
          <p className="text-stone-600">
            {isSignUp ? 'Create your account' : 'Sign in to continue'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-white border border-stone-200 rounded-lg px-4 py-3 text-stone-900 placeholder:text-stone-400 focus:ring-2 focus:ring-stone-400 focus:border-transparent"
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-stone-900 hover:bg-stone-800 text-white"
          >
            {loading ? 'Please wait...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-stone-600 hover:text-stone-900"
            >
              {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
            </button>
          </div>
        </form>
      </Card>
    </main>
  );
}

