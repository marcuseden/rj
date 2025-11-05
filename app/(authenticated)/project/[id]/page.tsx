'use client';

import { useParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, DollarSign, MapPin, Building2, FileText, ExternalLink } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { createClient } from '@/lib/supabase';

interface Project {
  id: string;
  project_name: string;
  country_name: string;
  country_code: string;
  sector: string;
  theme?: string;
  status: string;
  approval_date?: string;
  closing_date?: string;
  total_amt?: number;
  ibrd_amt?: number;
  ida_amt?: number;
  project_url?: string;
  region?: string;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [relatedProjects, setRelatedProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      // Parse the project ID (format: project-{countryCode}-{index})
      const parts = projectId.split('-');
      const countryCode = parts[1];
      
      const supabase = createClient();
      const { data: countryData } = await supabase
        .from('worldbank_countries')
        .select('recent_projects, name, region')
        .eq('iso2_code', countryCode.toUpperCase())
        .single();

      if (countryData?.recent_projects) {
        const projects = countryData.recent_projects as any[];
        const projectIndex = parseInt(parts[2]);
        const projectData = projects[projectIndex];
        
        if (projectData) {
          setProject({
            id: projectId,
            project_name: projectData.project_name || projectData.title || 'Unnamed Project',
            country_name: countryData.name,
            country_code: countryCode.toUpperCase(),
            sector: projectData.sector || 'N/A',
            theme: projectData.theme,
            status: projectData.status || 'Active',
            approval_date: projectData.approvalfy || projectData.board_approval_date,
            closing_date: projectData.closing_date,
            total_amt: projectData.total_amt || projectData.totalamt,
            ibrd_amt: projectData.ibrd_amt,
            ida_amt: projectData.ida_amt,
            project_url: projectData.project_url || projectData.url,
            region: countryData.region
          });

          // Get other projects from same country as related
          setRelatedProjects(
            projects
              .filter((_, idx) => idx !== projectIndex)
              .slice(0, 5)
              .map((p, idx) => ({
                id: `project-${countryCode}-${idx}`,
                project_name: p.project_name || p.title || 'Unnamed Project',
                country_name: countryData.name,
                country_code: countryCode.toUpperCase(),
                sector: p.sector || 'N/A',
                status: p.status || 'Active',
                total_amt: p.total_amt || p.totalamt,
                region: countryData.region
              }))
          );
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900"></div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-stone-50 p-8">
        <Card className="max-w-2xl mx-auto p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-stone-400" />
          <h2 className="text-2xl font-bold text-stone-900 mb-2">Project Not Found</h2>
          <p className="text-stone-600 mb-6">The project you're looking for doesn't exist.</p>
          <Link href="/worldbank-search">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <Link href="/worldbank-search">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Search
            </Button>
          </Link>
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-indigo-100 text-indigo-700 border-indigo-200">
                  World Bank Project
                </Badge>
                <Badge className={
                  project.status?.toLowerCase() === 'active' || project.status?.toLowerCase() === 'implementation'
                    ? 'bg-green-100 text-green-700 border-green-200'
                    : project.status?.toLowerCase() === 'closed'
                    ? 'bg-stone-100 text-stone-700 border-stone-200'
                    : 'bg-yellow-100 text-yellow-700 border-yellow-200'
                }>
                  {project.status}
                </Badge>
              </div>
              
              <h1 className="text-3xl font-bold text-stone-900 mb-2">
                {project.project_name}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-stone-600">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <Link href={`/country/${encodeURIComponent(project.country_name)}`} className="hover:text-[#0071bc]">
                    {project.country_name}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  <span>{project.sector}</span>
                </div>
                {project.region && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{project.region}</span>
                  </div>
                )}
              </div>
            </div>

            {project.project_url && (
              <a href={project.project_url} target="_blank" rel="noopener noreferrer">
                <Button variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View on World Bank
                </Button>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Financial Information */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-[#0071bc]" />
                  Financial Details
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {project.total_amt && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1">Total Amount</div>
                      <div className="text-2xl font-bold text-[#0071bc]">
                        ${project.total_amt.toLocaleString()}M
                      </div>
                    </div>
                  )}
                  
                  {project.ibrd_amt && project.ibrd_amt > 0 && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1">IBRD Commitment</div>
                      <div className="text-xl font-semibold text-stone-700">
                        ${project.ibrd_amt.toLocaleString()}M
                      </div>
                    </div>
                  )}
                  
                  {project.ida_amt && project.ida_amt > 0 && (
                    <div>
                      <div className="text-sm text-stone-500 mb-1">IDA Commitment</div>
                      <div className="text-xl font-semibold text-stone-700">
                        ${project.ida_amt.toLocaleString()}M
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Timeline */}
            {(project.approval_date || project.closing_date) && (
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-[#0071bc]" />
                    Timeline
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {project.approval_date && (
                      <div>
                        <div className="text-sm text-stone-500 mb-1">Approval Date</div>
                        <div className="text-lg font-medium text-stone-700">
                          {project.approval_date}
                        </div>
                      </div>
                    )}
                    
                    {project.closing_date && (
                      <div>
                        <div className="text-sm text-stone-500 mb-1">Closing Date</div>
                        <div className="text-lg font-medium text-stone-700">
                          {project.closing_date}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Sector & Theme */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold text-stone-900 mb-4">
                  Sector & Focus Area
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-stone-500 mb-2">Sector</div>
                    <Badge className="bg-blue-50 text-blue-700 border-blue-200">
                      {project.sector}
                    </Badge>
                  </div>
                  
                  {project.theme && (
                    <div>
                      <div className="text-sm text-stone-500 mb-2">Theme</div>
                      <Badge className="bg-purple-50 text-purple-700 border-purple-200">
                        {project.theme}
                      </Badge>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Related Projects */}
            {relatedProjects.length > 0 && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-stone-900 mb-4">
                    Other Projects in {project.country_name}
                  </h3>
                  
                  <div className="space-y-3">
                    {relatedProjects.map((related) => (
                      <Link key={related.id} href={`/project/${related.id}`}>
                        <div className="p-3 border border-stone-200 rounded-lg hover:border-[#0071bc] hover:shadow-md transition-all cursor-pointer">
                          <div className="text-sm font-medium text-stone-900 mb-1">
                            {related.project_name}
                          </div>
                          <div className="text-xs text-stone-500 mb-2">
                            {related.sector}
                          </div>
                          {related.total_amt && (
                            <div className="text-sm font-semibold text-[#0071bc]">
                              ${related.total_amt.toLocaleString()}M
                            </div>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                  
                  <Link href={`/country/${encodeURIComponent(project.country_name)}`}>
                    <Button variant="outline" className="w-full mt-4">
                      View All Projects in {project.country_name}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
