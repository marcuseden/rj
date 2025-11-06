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
  const [stats, setStats] = useState({
    projects: 0,
    countries: 0,
    documents: 0,
    leadership: 0,
  });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) {
        router.push('/vision');
      }
    });

    // Fetch real stats
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      // Get projects count
      const { count: projectsCount } = await supabase
        .from('worldbank_projects')
        .select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, projects: projectsCount || 0 }));

      // Get countries count
      const { count: countriesCount } = await supabase
        .from('worldbank_countries')
        .select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, countries: countriesCount || 0 }));

      // Get documents count
      const { count: docsCount } = await supabase
        .from('worldbank_documents')
        .select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, documents: docsCount || 0 }));

      // Get leadership count
      const { count: leadershipCount } = await supabase
        .from('worldbank_orgchart')
        .select('*', { count: 'exact', head: true });
      setStats(prev => ({ ...prev, leadership: leadershipCount || 0 }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const features = [
    {
      icon: MessageSquare,
      title: 'AI Agent',
      description: 'Voice conversations with AI assistant trained on global development strategies',
    },
    {
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Browse comprehensive strategic documents and policy papers',
    },
    {
      icon: Search,
      title: 'Document Search',
      description: 'Search through extensive global development documentation',
    },
    {
      icon: FileEdit,
      title: 'Writing Assistant',
      description: 'Align your writing with professional leadership communication style',
    },
    {
      icon: Building2,
      title: 'Organization Chart',
      description: 'Explore departments and leadership structure',
    },
  ];

  if (user) {
    return null; // Will redirect to vision
  }

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Hero Section with Full-Width Image */}
      <div className="relative h-[600px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img 
            src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2000&auto=format&fit=crop"
            alt="Global Network" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0071bc]/90 via-[#0071bc]/80 to-[#005a99]/90"></div>
        </div>
        
        {/* Hero Content */}
        <div className="relative h-full flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center text-white">
              <Badge className="mb-6 bg-white/20 backdrop-blur-sm text-white border-white/30">
                AI Assistant
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold mb-6 drop-shadow-2xl">
                Strategic Alignment Platform
              </h1>
              <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto mb-8 drop-shadow-lg">
                AI-powered insights into global development strategy and leadership
              </p>
              
              {/* Stats */}
              <div className="flex items-center justify-center gap-6 md:gap-10 mb-10 flex-wrap">
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {stats.projects > 0 ? stats.projects.toLocaleString() : '5,000'}+
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Projects</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {stats.countries > 0 ? stats.countries : '211'}
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Countries</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {stats.documents > 0 ? stats.documents : '50'}+
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Documents</div>
                </div>
                <div className="w-px h-12 bg-white/30"></div>
                <div className="text-center">
                  <div className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {stats.leadership > 0 ? stats.leadership : '35'}+
                  </div>
                  <div className="text-sm md:text-base text-blue-100">Leadership</div>
                </div>
              </div>
              
              {/* CTA Button */}
              <Link href="/login">
                <Button className="bg-white text-[#0071bc] hover:bg-blue-50 px-10 py-7 text-lg font-semibold shadow-2xl">
                  Log In
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-20">

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
              Why Use Strategic Alignment Platform?
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                'AI-powered analysis of global development strategy',
                'Voice conversations with AI leadership agent',
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
              Sign up now to access AI-powered strategic insights
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
          <p>© 2024 Strategic Alignment Platform. AI Assistant.</p>
        </div>
      </footer>
    </main>
  );
}
