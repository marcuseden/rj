'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Heart, Lightbulb, Users, TrendingUp, Globe, Sparkles, Quote } from 'lucide-react';

export default function VisionPage() {
  const values = [
    { icon: Users, title: 'Partnership', description: 'Collaboration between governments, private sector, and development banks' },
    { icon: Target, title: 'Accountability', description: 'Measurable results and transparent progress tracking' },
    { icon: Lightbulb, title: 'Innovation', description: 'Embracing new approaches and calculated risks' },
    { icon: Heart, title: 'Equity', description: 'Ensuring inclusive development for all communities' },
    { icon: Globe, title: 'Sustainability', description: 'Building a livable planet for future generations' },
    { icon: TrendingUp, title: 'Results-Driven', description: 'Focus on concrete actions and measurable outcomes' },
  ];

  const priorities = [
    { title: 'Evolution Roadmap', description: 'Institutional reform to make the World Bank faster, more effective, and better integrated' },
    { title: 'Climate Action', description: '45% of financing for climate by 2025 - over $40 billion annually for mitigation and adaptation' },
    { title: 'Job Creation', description: 'Explicit focus on creating opportunities for 1.2 billion young people' },
    { title: 'Private Capital', description: 'Mobilizing $150+ billion in private sector commitments for development' },
    { title: 'Food Security', description: '$9 billion annually by 2030 for agribusiness and food systems' },
    { title: 'IDA Replenishment', description: 'Expanding concessional financing for low-income countries' },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Badge className="mb-4 bg-[#0071bc] text-white border-0">
            Leadership Vision
          </Badge>
          <h1 className="text-4xl font-bold text-stone-900 mb-2">
            Ajay Banga's Strategic Vision
          </h1>
          <p className="text-lg text-stone-600">
            President, World Bank Group
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Vision Statement */}
        <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 mb-12">
          <CardContent className="p-8">
            <div className="flex items-start gap-4 mb-4">
              <Quote className="h-8 w-8 text-blue-200 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-white mb-4">Mission</h2>
                <p className="text-lg text-blue-50 leading-relaxed">
                  "Creating a world free of poverty on a livable planet through partnership, innovation, and measurable results. 
                  The World Bank Group's mission is to ensure that job creation is not a byproduct of our projects but an explicit aim, 
                  driving development through collaboration between governments, private sector, and development banks."
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Core Values */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">
            Core Values
          </h2>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <Card key={index} className="bg-white border-stone-200">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-[#0071bc]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-stone-900 mb-1">{value.title}</h3>
                        <p className="text-sm text-stone-600">{value.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        {/* Strategic Priorities */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">
            Strategic Priorities
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            {priorities.map((priority, index) => (
              <Card key={index} className="bg-white border-stone-200">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0071bc] text-white flex items-center justify-center flex-shrink-0 font-bold text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900 mb-2">{priority.title}</h3>
                      <p className="text-stone-600 text-sm">{priority.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Communication Style */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold text-stone-900 mb-6">
            Communication Style
          </h2>
          
          <Card className="bg-white border-stone-200">
            <CardContent className="p-6 space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-stone-900 mb-3">Direct & Action-Oriented</h3>
                <p className="text-stone-700 leading-relaxed">
                  Uses clear, direct language focused on concrete actions and measurable outcomes. 
                  Common phrases include "Let me be direct," "The facts are stark," and "The challenge before us."
                </p>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-3">Collaborative Emphasis</h3>
                <p className="text-stone-700 leading-relaxed">
                  Consistently emphasizes partnership and collective action. Frequently uses "together," "partnership," 
                  and "collaboration" to stress the importance of working across sectors.
                </p>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-3">Data-Driven Arguments</h3>
                <p className="text-stone-700 leading-relaxed">
                  Supports statements with specific numbers, facts, and measurable targets. 
                  References concrete data points to build credible, compelling cases for action.
                </p>
              </div>

              <div className="border-t border-stone-200 pt-6">
                <h3 className="text-xl font-semibold text-stone-900 mb-3">Professional Yet Accessible</h3>
                <p className="text-stone-700 leading-relaxed">
                  Maintains a professional tone while keeping language accessible and engaging. 
                  Balances technical expertise with clear communication for diverse audiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Key Themes */}
        <section>
          <h2 className="text-3xl font-bold text-stone-900 mb-6">
            Key Themes Across Speeches
          </h2>
          
          <Card className="bg-white border-stone-200">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-2">
                {[
                  'Development Finance & IDA',
                  'Private Sector Partnership',
                  'Climate Finance & Energy Access',
                  'Job Creation & Economic Opportunity',
                  'Food Security & Agriculture',
                  'Reform & Innovation',
                  'Poverty Reduction',
                  'Infrastructure Investment'
                ].map((theme, index) => (
                  <Badge
                    key={index}
                    className="bg-blue-50 text-[#0071bc] border-blue-200 px-4 py-2"
                  >
                    {theme}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
