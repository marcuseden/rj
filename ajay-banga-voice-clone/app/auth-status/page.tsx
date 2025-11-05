'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { formatDate } from '@/lib/utils';

export default function AuthStatusPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [cookies, setCookies] = useState<string>('');
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
    setCookies(document.cookie || 'No cookies');
  }, []);

  const checkAuth = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    setUser(user);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    router.push('/');
  };

  const clearAllCookies = () => {
    document.cookie.split(";").forEach((c) => {
      document.cookie = c
        .replace(/^ +/, "")
        .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
    window.location.reload();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <p className="text-white">Checking authentication status...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">🔍 Authentication Status Checker</h1>

        <div className="space-y-6">
          {/* Auth Status */}
          <Card className="bg-slate-900 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Authentication Status</h2>
            
            {user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-2xl">✅</span>
                  <span className="text-white font-semibold">You are logged in</span>
                </div>
                
                <div className="bg-slate-950 rounded-lg p-4 space-y-2">
                  <p className="text-slate-400">
                    <span className="font-semibold text-white">Email:</span> {user.email}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-semibold text-white">User ID:</span> {user.id}
                  </p>
                  <p className="text-slate-400">
                    <span className="font-semibold text-white">Last Sign In:</span> {formatDate(user.last_sign_in_at)}
                  </p>
                </div>

                <div className="pt-4 space-y-2">
                  <p className="text-slate-300 text-sm">
                    ℹ️ This is why you can access the dashboard without being redirected to login.
                  </p>
                  <Button
                    onClick={handleSignOut}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-2xl">❌</span>
                  <span className="text-white font-semibold">You are NOT logged in</span>
                </div>
                
                <p className="text-slate-300 text-sm">
                  ✅ Middleware protection is working! You would be redirected if you tried to access protected routes.
                </p>

                <Button
                  onClick={() => router.push('/login')}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Go to Login
                </Button>
              </div>
            )}
          </Card>

          {/* Cookies Info */}
          <Card className="bg-slate-900 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Browser Cookies</h2>
            
            <div className="bg-slate-950 rounded-lg p-4 mb-4">
              <p className="text-slate-400 text-sm font-mono break-all">
                {cookies}
              </p>
            </div>

            <Button
              onClick={clearAllCookies}
              variant="outline"
              className="border-slate-600 text-white hover:bg-slate-800"
            >
              Clear All Cookies & Reload
            </Button>
          </Card>

          {/* Protection Test */}
          <Card className="bg-slate-900 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Test Protection</h2>
            
            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Click these buttons to test if middleware is protecting routes:
              </p>

              <div className="space-y-2">
                <Button
                  onClick={() => router.push('/dashboard')}
                  className="w-full bg-slate-700 hover:bg-slate-600"
                >
                  Try Access Dashboard
                </Button>
                
                <Button
                  onClick={() => router.push('/rj-agent')}
                  className="w-full bg-slate-700 hover:bg-slate-600"
                >
                  Try Access AI Agent
                </Button>
                
                <Button
                  onClick={() => router.push('/rj-faq')}
                  className="w-full bg-slate-700 hover:bg-slate-600"
                >
                  Try Access Speeches
                </Button>
              </div>

              {user ? (
                <p className="text-green-400 text-sm pt-2">
                  ✅ You should be able to access all these pages (you're logged in)
                </p>
              ) : (
                <p className="text-yellow-400 text-sm pt-2">
                  ⚠️ You should be redirected to login (you're not logged in)
                </p>
              )}
            </div>
          </Card>

          {/* Instructions */}
          <Card className="bg-slate-900 border-slate-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">How to Test Properly</h2>
            
            <div className="space-y-4 text-slate-300 text-sm">
              <div>
                <h3 className="text-white font-semibold mb-2">Method 1: Sign Out</h3>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Click "Sign Out" button above</li>
                  <li>Try to access /dashboard</li>
                  <li>You should be redirected to /login</li>
                </ol>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Method 2: Incognito Mode</h3>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Open new incognito/private window</li>
                  <li>Go to http://localhost:3001/dashboard</li>
                  <li>You should be redirected to /login</li>
                </ol>
              </div>

              <div>
                <h3 className="text-white font-semibold mb-2">Method 3: Clear Cookies</h3>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Click "Clear All Cookies & Reload" above</li>
                  <li>Try to access /dashboard</li>
                  <li>You should be redirected to /login</li>
                </ol>
              </div>
            </div>
          </Card>
        </div>

        <div className="mt-8 text-center">
          <Button
            onClick={() => router.push('/')}
            variant="outline"
            className="border-slate-600 text-white hover:bg-slate-800"
          >
            ← Back to Home
          </Button>
        </div>
      </div>
    </main>
  );
}




