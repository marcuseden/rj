'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Heart, Lightbulb, Users, TrendingUp, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';
import speechesDatabase from '@/public/speeches_database.json';

export default function VisionPage() {
  const router = useRouter();

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
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-slate-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          
          <Badge className="bg-[#0071bc] text-white border-0">
            CEO Vision & Values
          </Badge>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* CEO Profile */}
        <section className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <Avatar className="w-32 h-32 ring-4 ring-[#0071bc] ring-offset-4 ring-offset-slate-950">
              <AvatarImage src="https://www.worldbank.org/content/dam/photos/780x439/2023/jun-3/Ajay-Banga.jpg" />
              <AvatarFallback className="bg-gradient-to-br from-[#0071bc] to-[#009fdb] text-white text-4xl font-bold">
                AB
              </AvatarFallback>
            </Avatar>
          </div>

          <h1 className="text-4xl font-bold text-white mb-2">Ajay Banga</h1>
          <p className="text-xl text-slate-400 mb-6">President, World Bank Group</p>
          
          <Card className="bg-slate-900/50 border-slate-700 p-6 text-left">
            <h2 className="text-2xl font-bold text-white mb-4">Vision Statement</h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              "Creating a world free of poverty on a livable planet through partnership, innovation, and measurable results. 
              The World Bank Group's mission is to ensure that job creation is not a byproduct of our projects but an explicit aim, 
              driving development through collaboration between governments, private sector, and development banks."
            </p>
          </Card>
        </section>

        {/* Core Values */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Core Values</h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-slate-900/50 border-slate-700 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[#0071bc] to-[#009fdb] flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white mb-2">{value.title}</h3>
                      <p className="text-slate-400 text-sm">{value.description}</p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Communication Style */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Communication Style</h2>
          
          <Card className="bg-slate-900/50 border-slate-700 p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-white mb-2">Direct & Action-Oriented</h3>
              <p className="text-slate-400">
                Uses clear, direct language focused on concrete actions and measurable outcomes. 
                Common phrases include "Let me be direct," "The facts are stark," and "The challenge before us."
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Collaborative Emphasis</h3>
              <p className="text-slate-400">
                Consistently emphasizes partnership and collective action. Frequently uses "together," "partnership," 
                and "collaboration" to stress the importance of working across sectors.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Data-Driven Arguments</h3>
              <p className="text-slate-400">
                Supports statements with specific numbers, facts, and measurable targets. 
                References concrete data points to build credible, compelling cases for action.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold text-white mb-2">Professional Yet Accessible</h3>
              <p className="text-slate-400">
                Maintains a professional tone while keeping language accessible and engaging. 
                Balances technical expertise with clear communication for diverse audiences.
              </p>
            </div>
          </Card>
        </section>

        {/* Key Themes */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-white mb-8">Key Themes</h2>
          
          <div className="flex flex-wrap gap-3">
            {themes.map((theme, index) => (
              <Badge
                key={index}
                variant="outline"
                className="border-[#0071bc]/30 bg-[#0071bc]/10 text-[#009fdb] px-4 py-2 text-sm"
              >
                {theme}
              </Badge>
            ))}
          </div>
        </section>

        {/* Speech Database Stats */}
        <section>
          <h2 className="text-3xl font-bold text-white mb-8">Analysis Database</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="bg-slate-900/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-[#0071bc] mb-2">
                {speechesDatabase.total_speeches}
              </div>
              <div className="text-slate-400">Real Speeches</div>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-[#0071bc] mb-2">
                {speechesDatabase.total_words.toLocaleString()}
              </div>
              <div className="text-slate-400">Words Analyzed</div>
            </Card>

            <Card className="bg-slate-900/50 border-slate-700 p-6 text-center">
              <div className="text-4xl font-bold text-[#0071bc] mb-2">
                2023-2025
              </div>
              <div className="text-slate-400">Time Period</div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="mt-16 text-center">
          <Button
            onClick={() => router.push('/dashboard')}
            size="lg"
            className="bg-gradient-to-r from-[#0071bc] to-[#009fdb] hover:from-[#005a99] hover:to-[#0071bc] text-white"
          >
            Test Your Content Alignment
          </Button>
        </section>
      </div>
    </main>
  );
}

