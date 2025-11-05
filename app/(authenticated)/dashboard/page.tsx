'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  BookOpen, 
  Search, 
  FileEdit, 
  Building2, 
  Eye,
  ArrowRight,
  Sparkles,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    documents: 0,
    speeches: 0,
    departments: 0,
    aiFeatures: 6,
  });
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
    });
    fetchDynamicStats();
  }, []);

  const fetchDynamicStats = async () => {
    try {
      // Get real documents count
      const docsRes = await fetch('/data/worldbank-strategy/ajay-banga-documents-verified.json');
      if (docsRes.ok) {
        const docs = await docsRes.json();
        setStats(prev => ({ ...prev, documents: docs.length }));
      }

      // Get real speeches count
      const speechesRes = await fetch('/speeches_database.json');
      if (speechesRes.ok) {
        const speeches = await speechesRes.json();
        setStats(prev => ({ ...prev, speeches: speeches.total_speeches || speeches.length }));
      }

      // Get real departments count
      const depsRes = await fetch('/api/worldbank-orgchart');
      if (depsRes.ok) {
        const deps = await depsRes.json();
        setStats(prev => ({ ...prev, departments: deps.hierarchy?.length || 0 }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const features = [
    {
      href: '/rj-agent',
      icon: MessageSquare,
      title: 'AI Agent',
      description: 'Chat with RJ Banga AI assistant trained on World Bank strategy',
      color: 'bg-blue-50 border-blue-200',
      iconColor: 'text-[#0071bc]',
    },
    {
      href: '/rj-faq',
      icon: BookOpen,
      title: 'Knowledge Base',
      description: 'Browse World Bank documents, speeches, and strategy papers',
      color: 'bg-stone-50 border-stone-200',
      iconColor: 'text-stone-600',
    },
    {
      href: '/worldbank-search',
      icon: Search,
      title: 'Document Search',
      description: 'Search through comprehensive World Bank documentation',
      color: 'bg-stone-50 border-stone-200',
      iconColor: 'text-stone-600',
    },
    {
      href: '/rj-writing-assistant',
      icon: FileEdit,
      title: 'Writing Assistant',
      description: 'Align your text with RJ Banga\'s communication style',
      color: 'bg-stone-50 border-stone-200',
      iconColor: 'text-stone-600',
    },
    {
      href: '/worldbank-orgchart',
      icon: Building2,
      title: 'Organization Chart',
      description: 'Explore World Bank departments and leadership',
      color: 'bg-stone-50 border-stone-200',
      iconColor: 'text-stone-600',
    },
    {
      href: '/vision',
      icon: Eye,
      title: 'Strategic Vision',
      description: 'RJ Banga\'s vision for the World Bank',
      color: 'bg-stone-50 border-stone-200',
      iconColor: 'text-stone-600',
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-white to-stone-50 border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className="h-8 w-8 text-[#0071bc]" />
            <h1 className="text-4xl font-bold text-stone-900">
              Welcome to Strategic Alignment Platform
            </h1>
          </div>
          <p className="text-xl text-stone-600 mb-6">
            AI-powered insights into World Bank strategy and Ajay Banga's leadership vision
          </p>
          {user && (
            <Badge className="bg-stone-100 text-stone-700 border-stone-200">
              Logged in as {user.email}
            </Badge>
          )}
        </div>
      </div>

      {/* Stats Section - Dynamic & Clickable */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Link href="/rj-faq">
            <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1">Documents</p>
                    <p className="text-3xl font-bold text-stone-900">{stats.documents || '...'}</p>
                  </div>
                  <BookOpen className="h-10 w-10 text-[#0071bc] opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/rj-agent">
            <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1">Speeches</p>
                    <p className="text-3xl font-bold text-stone-900">{stats.speeches || '...'}</p>
                  </div>
                  <MessageSquare className="h-10 w-10 text-[#0071bc] opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/worldbank-orgchart">
            <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-[#0071bc] transition-all cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-stone-600 mb-1">Leadership</p>
                    <p className="text-3xl font-bold text-stone-900">{stats.departments || '...'}</p>
                    <p className="text-xs text-stone-500 mt-1">100% verified</p>
                  </div>
                  <Building2 className="h-10 w-10 text-[#0071bc] opacity-20" />
                </div>
              </CardContent>
            </Card>
          </Link>

          <Card className="bg-white border-stone-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-stone-600 mb-1">AI Features</p>
                  <p className="text-3xl font-bold text-stone-900">{stats.aiFeatures}</p>
                </div>
                <Sparkles className="h-10 w-10 text-[#0071bc] opacity-20" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Feature Cards */}
        <div>
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">
            Explore Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.href} href={feature.href}>
                  <Card className={`${feature.color} hover:shadow-lg transition-all cursor-pointer h-full`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-lg bg-white flex items-center justify-center`}>
                          <Icon className={`h-6 w-6 ${feature.iconColor}`} />
                        </div>
                        <ArrowRight className="h-5 w-5 text-stone-400" />
                      </div>
                      <h3 className="text-lg font-semibold text-stone-900 mb-2">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-stone-600">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 mt-8">
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Ready to get started?
                </h3>
                <p className="text-blue-100">
                  Try the AI Agent to chat about World Bank strategy
                </p>
              </div>
              <Link href="/rj-agent">
                <Button className="bg-white text-[#0071bc] hover:bg-stone-50">
                  Start Chat
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
