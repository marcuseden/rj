'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Phone, Upload, BookOpen, Sparkles, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Check if user is logged in
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: Phone,
      title: 'Voice Call',
      description: 'Talk directly with CEO AI in their authentic voice',
      action: () => router.push('/dashboard'),
      color: 'from-green-500 to-green-600'
    },
    {
      icon: Upload,
      title: 'Test Alignment',
      description: 'Upload content to check CEO values & style match',
      action: () => router.push('/dashboard'),
      color: 'from-[#0071bc] to-[#009fdb]'
    },
    {
      icon: BookOpen,
      title: 'Read Vision',
      description: 'Explore CEO vision, values & communication patterns',
      action: () => router.push('/vision'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: Sparkles,
      title: 'AI Rewriting',
      description: 'Get your content rewritten in CEO\'s voice',
      action: () => router.push('/dashboard'),
      color: 'from-amber-500 to-amber-600'
    }
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#0071bc] to-[#009fdb] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">CEO Alignment Checker</h1>
              <p className="text-xs text-slate-400">World Bank Group</p>
            </div>
          </div>
          
          {user ? (
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc]"
            >
              Go to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Link href="/login">
              <Button className="bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc]">
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Avatar className="w-32 h-32 ring-4 ring-[#0071bc] ring-offset-4 ring-offset-slate-950">
            <AvatarImage src="https://www.worldbank.org/content/dam/photos/780x439/2023/jun-3/Ajay-Banga.jpg" />
            <AvatarFallback className="bg-gradient-to-br from-[#0071bc] to-[#009fdb] text-white text-4xl font-bold">
              AB
            </AvatarFallback>
          </Avatar>
        </div>

        <Badge className="bg-[#0071bc] text-white border-0 mb-4">
          President, World Bank Group
        </Badge>

        <h2 className="text-5xl font-bold text-white mb-6">
          Ajay Banga
        </h2>

        <p className="text-2xl text-slate-300 mb-4 max-w-3xl mx-auto">
          Test if your content aligns with CEO values, vision & communication style
        </p>

        <p className="text-lg text-slate-400 mb-8 max-w-2xl mx-auto">
          AI-powered analysis based on 14 real speeches • 19,904 words analyzed
        </p>

        {!user && (
          <Link href="/login">
            <Button 
              size="lg"
              className="bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc] text-white text-lg px-8 py-6"
            >
              Get Started
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        )}
      </section>

      {/* Features Grid */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          What You Can Do
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-slate-900/50 border-slate-700 p-8 hover:bg-slate-900 transition-colors cursor-pointer"
                onClick={feature.action}
              >
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                
                <h4 className="text-2xl font-bold text-white mb-3">
                  {feature.title}
                </h4>
                
                <p className="text-slate-400 mb-4">
                  {feature.description}
                </p>

                <div className="flex items-center text-[#0071bc] font-semibold">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-4 py-16">
        <h3 className="text-3xl font-bold text-white text-center mb-12">
          How It Works
        </h3>

        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0071bc] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">1</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Sign In</h4>
                <p className="text-slate-400">Create your account with email & password</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0071bc] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">2</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Upload Content</h4>
                <p className="text-slate-400">Paste your speech, article, or statement to test alignment</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0071bc] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">3</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Get AI Feedback</h4>
                <p className="text-slate-400">Receive alignment score, gaps, and rewritten version in CEO's voice</p>
              </div>
            </div>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700 p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[#0071bc] flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold">4</span>
              </div>
              <div>
                <h4 className="text-xl font-bold text-white mb-2">Talk to CEO AI</h4>
                <p className="text-slate-400">Start a voice call to discuss with the AI in Ajay Banga's voice</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="max-w-5xl mx-auto px-4 py-20 text-center">
          <Card className="bg-gradient-to-br from-[#0071bc]/10 to-[#009fdb]/10 border-[#0071bc]/30 p-12">
            <h3 className="text-4xl font-bold text-white mb-4">
              Ready to get started?
            </h3>
            <p className="text-xl text-slate-300 mb-8">
              Create your account and start testing content alignment today
            </p>
            <Link href="/login">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc] text-white text-lg px-8 py-6"
              >
                Sign Up Now
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
          </Card>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-20">
        <div className="max-w-7xl mx-auto px-4 py-8 text-center text-slate-400 text-sm">
          <p>© 2025 CEO Alignment Checker • World Bank Group</p>
          <p className="mt-2">Powered by ElevenLabs AI & OpenAI</p>
        </div>
      </footer>
    </main>
  );
}
