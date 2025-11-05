'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, 
  Target,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const sections = [
    {
      icon: BookOpen,
      title: 'Browse CEO Speeches',
      description: 'Search and filter through 14 speeches with 19,904 words analyzed',
      route: '/rj-faq',
      badge: 'Library',
      stats: '14 Speeches'
    },
    {
      icon: Target,
      title: 'CEO Vision & Values',
      description: 'Explore Ajay Banga\'s vision, values, and leadership philosophy',
      route: '/vision',
      badge: 'Vision',
      stats: 'Strategic Focus'
    },
  ];

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-semibold text-stone-900 mb-3">
            Welcome back
          </h1>
          <p className="text-lg text-stone-600">
            Explore CEO speeches and leadership philosophy
          </p>
        </div>

        {/* Main Sections Grid */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {sections.map((section, index) => {
            const Icon = section.icon;
            return (
              <Link key={index} href={section.route}>
                <Card className="bg-white border border-stone-200 p-8 hover:border-stone-300 hover:shadow-sm transition-all cursor-pointer h-full group">
                  <div className="flex flex-col h-full">
                    {/* Icon & Badge */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="w-12 h-12 rounded-lg bg-stone-100 flex items-center justify-center group-hover:bg-stone-200 transition-colors">
                        <Icon className="w-6 h-6 text-stone-700" />
                      </div>
                      <Badge className="bg-stone-50 text-stone-700 border-stone-200">
                        {section.badge}
                      </Badge>
                    </div>

                    {/* Content */}
                    <div className="flex-1 mb-6">
                      <h3 className="text-xl font-semibold text-stone-900 mb-2">
                        {section.title}
                      </h3>
                      <p className="text-stone-600 leading-relaxed">
                        {section.description}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                      <span className="text-sm text-stone-500">{section.stats}</span>
                      <div className="flex items-center text-stone-900 text-sm font-medium group-hover:gap-2 transition-all">
                        Open
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Info Section */}
        <Card className="bg-stone-100 border-stone-200 p-8">
          <h3 className="text-xl font-semibold text-stone-900 mb-3">
            About this Collection
          </h3>
          <p className="text-stone-700 leading-relaxed mb-4">
            This platform provides access to a curated collection of speeches and insights from Ajay Banga, 
            President of the World Bank Group. The collection includes 14 speeches totaling 19,904 words, 
            offering deep insights into his vision, values, and leadership approach.
          </p>
          <div className="grid md:grid-cols-3 gap-4 text-sm">
            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="font-medium text-stone-900 mb-1">Comprehensive Analysis</p>
              <p className="text-stone-600">Every speech tagged and searchable</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="font-medium text-stone-900 mb-1">Strategic Insights</p>
              <p className="text-stone-600">Key themes and values identified</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-stone-200">
              <p className="font-medium text-stone-900 mb-1">Easy Navigation</p>
              <p className="text-stone-600">Filter by topics and themes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
