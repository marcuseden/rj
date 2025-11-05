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
    // Check if user is logged in and redirect to dashboard
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        router.push('/dashboard');
      } else {
        setUser(null);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        router.push('/dashboard');
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const features = [
    {
      icon: Phone,
      title: 'Voice Call',
      description: 'Talk directly with CEO AI in their authentic voice',
      action: () => router.push('/dashboard'),
      color: 'from-green-500 to-green-600',
      route: '/dashboard'
    },
    {
      icon: Upload,
      title: 'Test Alignment',
      description: 'Upload content to check CEO values & style match',
      action: () => router.push(user ? '/rj-writing-assistant' : '/login'),
      color: 'from-[#0071bc] to-[#009fdb]',
      route: '/rj-writing-assistant'
    },
    {
      icon: BookOpen,
      title: 'Browse Speeches',
      description: 'Search and filter 14+ CEO speeches by tags',
      action: () => router.push(user ? '/rj-faq' : '/login'),
      color: 'from-purple-500 to-purple-600',
      route: '/rj-faq'
    },
    {
      icon: Sparkles,
      title: 'AI Chat Agent',
      description: 'Chat with AI trained on CEO knowledge base',
      action: () => router.push(user ? '/rj-agent' : '/login'),
      color: 'from-amber-500 to-amber-600',
      route: '/rj-agent'
    }
  ];

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="border-b border-stone-200 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-xl font-semibold text-stone-900">CEO Alignment Checker</h1>
              <p className="text-xs text-stone-500">World Bank Group</p>
            </div>
          </div>
          
          <Link href="/login">
            <Button className="bg-stone-900 hover:bg-stone-800 text-white">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <div className="flex justify-center mb-8">
          <Avatar className="w-32 h-32 ring-2 ring-stone-200">
            <AvatarImage 
              src="/ajay-banga.svg"
              onError={(e) => {
                // Silently handle image load error - fallback will be shown
                e.currentTarget.style.display = 'none';
              }}
            />
            <AvatarFallback className="bg-stone-200 text-stone-700 text-4xl font-semibold">
              AB
            </AvatarFallback>
          </Avatar>
        </div>

        <Badge className="bg-stone-100 text-stone-700 border-stone-200 mb-4">
          President, World Bank Group
        </Badge>

        <h2 className="text-5xl font-semibold text-stone-900 mb-6">
          Ajay Banga
        </h2>

        <p className="text-2xl text-stone-700 mb-4 max-w-3xl mx-auto">
          Test if your content aligns with CEO values, vision & communication style
        </p>

        <p className="text-lg text-stone-600 mb-8 max-w-2xl mx-auto">
          AI-powered analysis based on 14 real speeches • 19,904 words analyzed
        </p>

        <Link href="/login">
          <Button 
            size="lg"
            className="bg-stone-900 hover:bg-stone-800 text-white text-lg px-8 py-6"
          >
            Get Started
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </Link>
      </section>

      {/* Features Grid */}
      <section className="max-w-5xl mx-auto px-6 py-16 bg-white">
        <h3 className="text-3xl font-semibold text-stone-900 text-center mb-12">
          What You Can Do
        </h3>

        <div className="grid md:grid-cols-2 gap-6">
          {features.slice(1, 3).map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card 
                key={index}
                className="bg-stone-50 border-stone-200 p-8 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={feature.action}
              >
                <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mb-6">
                  <Icon className="w-8 h-8 text-stone-700" />
                </div>
                
                <h4 className="text-2xl font-semibold text-stone-900 mb-3">
                  {feature.title}
                </h4>
                
                <p className="text-stone-600 mb-4 leading-relaxed">
                  {feature.description}
                </p>

                <div className="flex items-center text-stone-900 font-medium">
                  Learn more
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h3 className="text-3xl font-semibold text-stone-900 text-center mb-12">
          How It Works
        </h3>

        <div className="space-y-4">
          <Card className="bg-white border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                <span className="text-stone-900 font-semibold">1</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-stone-900 mb-2">Sign In</h4>
                <p className="text-stone-600">Create your account with email & password</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                <span className="text-stone-900 font-semibold">2</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-stone-900 mb-2">Browse Speeches</h4>
                <p className="text-stone-600">Explore 14 speeches with comprehensive analysis and themes</p>
              </div>
            </div>
          </Card>

          <Card className="bg-white border-stone-200 p-6 hover:border-stone-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center flex-shrink-0">
                <span className="text-stone-900 font-semibold">3</span>
              </div>
              <div>
                <h4 className="text-xl font-semibold text-stone-900 mb-2">Understand Values</h4>
                <p className="text-stone-600">Deep dive into CEO vision, values, and communication style</p>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-5xl mx-auto px-6 py-20 text-center">
        <Card className="bg-stone-100 border-stone-200 p-12">
          <h3 className="text-4xl font-semibold text-stone-900 mb-4">
            Ready to get started?
          </h3>
          <p className="text-xl text-stone-600 mb-8">
            Create your account and explore CEO speeches and values today
          </p>
          <Link href="/login">
            <Button 
              size="lg"
              className="bg-stone-900 hover:bg-stone-800 text-white text-lg px-8 py-6"
            >
              Sign Up Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-stone-200 mt-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 text-center text-stone-500 text-sm">
          <p>© 2025 CEO Alignment Checker • World Bank Group</p>
          <p className="mt-2">Powered by ElevenLabs AI & OpenAI</p>
        </div>
      </footer>
    </main>
  );
}
