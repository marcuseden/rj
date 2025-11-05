'use client';

import { AppLayout } from '@/components/app-layout';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Target, Heart, Lightbulb, Users, TrendingUp, Globe } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatNumber } from '@/lib/utils';

export default function VisionPage() {
  const [stats, setStats] = useState({ total_speeches: 14, total_words: 19904 });

  useEffect(() => {
    // Load stats from public JSON file
    fetch('/speeches_database.json')
      .then(res => res.json())
      .then(data => {
        setStats({ total_speeches: data.total_speeches, total_words: data.total_words });
      })
      .catch(err => console.error('Error loading stats:', err));
  }, []);
  const values = [
    { icon: Users, title: 'Partnership', description: 'Collaboration between governments, private sector, and development banks' },
    { icon: Target, title: 'Accountability', description: 'Measurable results and transparent progress tracking' },
    { icon: Lightbulb, title: 'Innovation', description: 'Embracing new approaches and calculated risks' },
    { icon: Heart, title: 'Equity', description: 'Ensuring inclusive development for all communities' },
    { icon: Globe, title: 'Sustainability', description: 'Building a livable planet for future generations' },
    { icon: TrendingUp, title: 'Results-Driven', description: 'Focus on concrete actions and measurable outcomes' },
  ];

  const themes = [
    'Development Finance & IDA',
    'Private Sector Partnership',
    'Climate Finance & Energy Access',
    'Job Creation & Economic Opportunity',
    'Food Security & Agriculture',
    'Reform & Innovation',
    'Poverty Reduction',
    'Infrastructure Investment'
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-stone-900 mb-3">
            CEO Vision & Values
          </h1>
          <p className="text-lg text-stone-600">
            Explore Ajay Banga's leadership philosophy and core principles
          </p>
        </div>

        {/* CEO Profile */}
        <section className="mb-12">
          <Card className="bg-white border-stone-200 p-8">
            <div className="flex items-center gap-6 mb-6">
              <Avatar className="w-20 h-20 ring-2 ring-stone-200">
                <AvatarImage src="/ajay-banga.svg" />
                <AvatarFallback className="bg-stone-200 text-stone-700 text-2xl font-semibold">
                  AB
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-stone-900">Ajay Banga</h2>
                <p className="text-stone-600">President, World Bank Group</p>
              </div>
            </div>
            
            <div className="bg-stone-50 border-l-4 border-stone-300 p-6 rounded">
              <h3 className="text-lg font-semibold text-stone-900 mb-3">Vision Statement</h3>
              <p className="text-stone-700 leading-relaxed">
                "Creating a world free of poverty on a livable planet through partnership, innovation, and measurable results. 
                The World Bank Group's mission is to ensure that job creation is not a byproduct of our projects but an explicit aim, 
                driving development through collaboration between governments, private sector, and development banks."
              </p>
            </div>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Core Values</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-white border-stone-200 p-6 hover:border-stone-300 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-stone-700" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 mb-2">{value.title}</h3>
                      <p className="text-stone-600 text-sm leading-relaxed">{value.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Communication Style */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Communication Style</h2>
          
          <Card className="bg-white border-stone-200 p-8 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Direct & Action-Oriented</h3>
              <p className="text-stone-600 leading-relaxed">
                Uses clear, direct language focused on concrete actions and measurable outcomes. 
                Common phrases include "Let me be direct," "The facts are stark," and "The challenge before us."
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Collaborative Emphasis</h3>
              <p className="text-stone-600 leading-relaxed">
                Consistently emphasizes partnership and collective action. Frequently uses "together," "partnership," 
                and "collaboration" to stress the importance of working across sectors.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Data-Driven Arguments</h3>
              <p className="text-stone-600 leading-relaxed">
                Supports statements with specific numbers, facts, and measurable targets. 
                References concrete data points to build credible, compelling cases for action.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-stone-900 mb-2">Professional Yet Accessible</h3>
              <p className="text-stone-600 leading-relaxed">
                Maintains a professional tone while keeping language accessible and engaging. 
                Balances technical expertise with clear communication for diverse audiences.
              </p>
            </div>
          </Card>
        </section>

        {/* Key Themes */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Key Themes</h2>
          
          <div className="flex flex-wrap gap-3">
            {themes.map((theme, index) => (
              <Badge
                key={index}
                className="bg-stone-100 text-stone-700 border-stone-200 px-4 py-2 text-sm"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </section>

        {/* Speech Database Stats */}
        <section>
          <h2 className="text-2xl font-semibold text-stone-900 mb-6">Analysis Database</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-white border-stone-200 p-6 text-center">
              <div className="text-4xl font-semibold text-stone-900 mb-2">
                {stats.total_speeches}
              </div>
              <div className="text-stone-600">Real Speeches</div>
            </Card>

            <Card className="bg-white border-stone-200 p-6 text-center">
              <div className="text-4xl font-semibold text-stone-900 mb-2">
                {formatNumber(stats.total_words)}
              </div>
              <div className="text-stone-600">Words Analyzed</div>
            </Card>

            <Card className="bg-white border-stone-200 p-6 text-center">
              <div className="text-4xl font-semibold text-stone-900 mb-2">
                2023-2025
              </div>
              <div className="text-stone-600">Time Period</div>
            </Card>
          </div>
        </section>
      </div>
    </AppLayout>
  );
}

