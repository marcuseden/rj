'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, Heart, Lightbulb, Users, TrendingUp, Globe, Sparkles, Quote, ArrowRight, CheckCircle } from 'lucide-react';

export default function VisionPage() {
  const priorities = [
    { 
      title: 'Evolution Roadmap', 
      description: 'Institutional reform to make the World Bank faster, more effective, and better integrated',
      slug: 'evolution-roadmap',
      icon: Sparkles
    },
    { 
      title: 'Climate Action', 
      description: '45% of financing for climate by 2025 - over $40 billion annually for mitigation and adaptation',
      slug: 'climate-action',
      icon: Globe
    },
    { 
      title: 'Job Creation', 
      description: 'Explicit focus on creating opportunities for 1.2 billion young people',
      slug: 'job-creation',
      icon: Users
    },
    { 
      title: 'Private Capital', 
      description: 'Mobilizing $150+ billion in private sector commitments for development',
      slug: 'private-capital',
      icon: TrendingUp
    },
    { 
      title: 'Food Security', 
      description: '$9 billion annually by 2030 for agribusiness and food systems',
      slug: 'food-security',
      icon: Target
    },
    { 
      title: 'IDA Replenishment', 
      description: 'Expanding concessional financing for low-income countries',
      slug: 'ida-replenishment',
      icon: Heart
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50 pt-16 md:pt-0">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-4 md:px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <Badge className="mb-3 md:mb-4 bg-[#0071bc] text-white border-0">
            Leadership Vision
          </Badge>
          <h1 className="text-2xl md:text-4xl font-bold text-stone-900 mb-2 mt-2 md:mt-0">
            Ajay Banga's Strategic Vision
          </h1>
          <p className="text-base md:text-lg text-stone-600">
            President, World Bank Group
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-6 md:py-12">
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

        {/* World Bank Group Core Values */}
        <section className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">
                World Bank Group Core Values
              </h2>
              <p className="text-stone-600 text-sm">
                Institutional values guiding the World Bank Group's work — explained in RJ Banga's communication style
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: Users, title: 'Partnership', description: 'Collaboration between governments, private sector, and development banks', slug: 'partnership' },
              { icon: Target, title: 'Accountability', description: 'Measurable results and transparent progress tracking', slug: 'accountability' },
              { icon: Lightbulb, title: 'Innovation', description: 'Embracing new approaches and calculated risks', slug: 'innovation' },
              { icon: Heart, title: 'Equity', description: 'Ensuring inclusive development for all communities', slug: 'equity' },
            ].map((value, index) => {
              const Icon = value.icon;
              return (
                <Link key={index} href={`/value/${value.slug}`}>
                  <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-lg bg-blue-50 group-hover:bg-blue-100 transition-colors flex items-center justify-center flex-shrink-0">
                          <Icon className="w-6 h-6 text-[#0071bc]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-semibold text-stone-900 group-hover:text-stone-700">{value.title}</h3>
                            <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-sm text-stone-600 mb-2">{value.description}</p>
                          <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Click to learn more
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Strategic Priorities */}
        <section className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">
                Strategic Priorities
              </h2>
              <p className="text-stone-600 text-sm">
                Current World Bank Group priorities under President Banga's leadership
              </p>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {priorities.map((priority, index) => {
              const PriorityIcon = priority.icon;
              return (
                <Link key={index} href={`/priority/${priority.slug}`}>
                  <Card className="bg-white border-stone-200 hover:shadow-lg hover:border-stone-300 transition-all cursor-pointer h-full group">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-stone-100 group-hover:bg-stone-200 transition-colors flex items-center justify-center flex-shrink-0">
                          <PriorityIcon className="w-5 h-5 text-stone-700" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h3 className="text-lg font-semibold text-stone-900 group-hover:text-stone-700">{priority.title}</h3>
                            <ArrowRight className="w-4 h-4 text-stone-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                          </div>
                          <p className="text-stone-600 text-sm">{priority.description}</p>
                          <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs mt-3">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            100% Verified · Click to learn more
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </section>

        {/* RJ Banga's Communication Style */}
        <section className="mb-12">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-3xl font-bold text-stone-900 mb-2">
                RJ Banga's Communication Style
              </h2>
              <p className="text-stone-600 text-sm">
                How President Ajay Banga communicates about World Bank Group's work
              </p>
            </div>
          </div>
          
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
