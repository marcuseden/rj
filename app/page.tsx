'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  MessageSquare, 
  BookOpen, 
  Search, 
  FileEdit, 
  Building2, 
  ArrowRight,
  Sparkles,
  CheckCircle
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LandingPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        router.push('/dashboard');
      }
    });
  }, [router]);

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Agent',
      description: 'Chat with RJ Banga AI assistant trained on speeches and World Bank strategy',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Browse comprehensive World Bank documents and strategic papers',
    },
    {
      icon: Search,
      title: 'Document Search',
      description: 'Search through extensive World Bank documentation',
    },
    {
      icon: FileEdit,
      title: 'Writing Assistant',
      description: 'Align your writing with RJ Banga\'s communication style',
    },
    {
      icon: Building2,
      title: 'Organization Chart',
      description: 'Explore World Bank departments and leadership structure',
    },
  ];

  if (user) {
    return null; // Will redirect to dashboard
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge className="mb-6 bg-[#0071bc] text-white border-0">
            World Bank AI Assistant
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold text-stone-900 mb-6">
            RJ Banga System
          </h1>
          <p className="text-xl md:text-2xl text-stone-600 max-w-3xl mx-auto mb-8">
            AI-powered insights into World Bank strategy and Ajay Banga's leadership vision
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/login">
              <Button className="bg-[#0071bc] hover:bg-[#005a99] text-white px-8 py-6 text-lg">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-20">
          <h2 className="text-3xl font-bold text-stone-900 text-center mb-12">
            Powerful Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Card key={idx} className="bg-white border-stone-200 p-6 hover:shadow-lg transition-all">
                  <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-[#0071bc]" />
                  </div>
                  <h3 className="text-xl font-semibold text-stone-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-stone-600">
                    {feature.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="max-w-4xl mx-auto mb-20">
          <Card className="bg-white border-stone-200 p-8">
            <h2 className="text-3xl font-bold text-stone-900 mb-8 text-center">
              Why Use RJ Banga System?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'AI-powered analysis of World Bank strategy',
                'Voice conversations with RJ Banga agent',
                'Comprehensive document search',
                'Writing style alignment tools',
                'Organization structure insights',
                'Real-time strategic information',
              ].map((benefit, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="h-6 w-6 text-[#0071bc] flex-shrink-0 mt-0.5" />
                  <span className="text-stone-700">{benefit}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 p-12 max-w-4xl mx-auto">
            <Sparkles className="h-12 w-12 text-white mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to explore?
            </h2>
            <p className="text-blue-100 text-lg mb-8">
              Sign up now to access AI-powered World Bank insights
            </p>
            <Link href="/login">
              <Button className="bg-white text-[#0071bc] hover:bg-stone-50 px-8 py-6 text-lg">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </Card>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-stone-200 py-8">
        <div className="container mx-auto px-4 text-center text-stone-600">
          <p>© 2024 RJ Banga System. World Bank AI Assistant.</p>
        </div>
      </footer>
    </main>
  );
}
