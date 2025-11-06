'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase';
import { 
  ArrowLeft, 
  ExternalLink,
  FileText,
  Calendar,
  DollarSign,
  MapPin,
  Users,
  Building2,
  CheckCircle,
  Clock,
  Target,
  Briefcase,
  Globe,
  Download,
  Youtube,
  Play
} from 'lucide-react';

interface ProjectData {
  id: string;
  project_name: string;
  url: string;
  country_code: string;
  country_name: string;
  region_name: string;
  total_commitment: number;
  ibrd_commitment: number;
  ida_commitment: number;
  total_amount_formatted: string;
  status: string;
  lending_instrument: string;
  product_line: string;
  team_lead: string;
  implementing_agency: string;
  borrower: string;
  board_approval_date: string;
  approval_fy: number;
  approval_month: string;
  closing_date: string;
  sectors: any[];
  themes: any[];
  major_theme: string;
  project_docs: any[];
  supplemental_project: boolean;
  data_verified: boolean;
  last_api_fetch: string;
  api_source: string;
}

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params?.id as string;
  
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!projectId) return;
    fetchProjectData(projectId);
  }, [projectId]);

  const fetchProjectData = async (id: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const supabase = createClient();
      
      console.log('🔍 [Project Page] Searching for project:', id);
      
      // Try to find the project by id field (which contains World Bank project codes like P501648)
      const { data, error: projectError } = await supabase
        .from('worldbank_projects')
        .select('*')
        .eq('id', id)
        .maybeSingle();
      
      if (data) {
        console.log('✅ [Project Page] Found project:', data.project_name);
      } else {
        console.error('❌ [Project Page] Project not found:', id);
        console.error('Error details:', projectError);
      }

      if (projectError && !data) {
        console.error('Error fetching project:', projectError);
        setError('Project not found. The project may not exist in our database yet.');
        setLoading(false);
        return;
      }

      if (!data) {
        console.error('❌ [Project Page] No data returned');
        setError('Project not found');
        setLoading(false);
        return;
      }

      console.log('✅ [Project Page] Project loaded:', data.project_name);
      setProject(data);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    if (!value) return '$0';
    if (value >= 1000) return `$${(value / 1000).toFixed(2)}B`;
    return `$${value.toFixed(2)}M`;
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'bg-green-50 text-green-700 border-green-200';
      case 'closed': return 'bg-gray-50 text-gray-700 border-gray-200';
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      default: return 'bg-stone-50 text-stone-700 border-stone-200';
    }
  };

  const extractYouTubeLinks = (docs: any[]) => {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.filter(doc => 
      doc.url?.includes('youtube.com') || 
      doc.url?.includes('youtu.be')
    );
  };

  const extractDocumentLinks = (docs: any[]) => {
    if (!docs || !Array.isArray(docs)) return [];
    return docs.filter(doc => 
      !doc.url?.includes('youtube.com') && 
      !doc.url?.includes('youtu.be')
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="bg-white border-stone-200 p-8 max-w-md text-center">
          <Briefcase className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Project Not Found</h2>
          <p className="text-stone-600 mb-4">{error || 'This project does not exist or has been removed.'}</p>
          <p className="text-sm text-stone-500 mb-6">
            Searched for: <code className="bg-stone-100 px-2 py-1 rounded">{projectId}</code>
          </p>
          <p className="text-xs text-stone-500 mb-6">
            Check the browser console for detailed logs about the search attempt.
          </p>
          <Button onClick={() => router.back()} className="bg-stone-900 hover:bg-stone-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const youtubeVideos = extractYouTubeLinks(project.project_docs);
  const documents = extractDocumentLinks(project.project_docs);

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-stone-600 hover:text-stone-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            
            <div className="flex items-center gap-2">
              {project.data_verified && (
                <Badge className="bg-green-50 text-green-700 border-green-200">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Project Hero */}
        <Card className="bg-gradient-to-br from-[#0071bc] via-[#005a99] to-[#003d6b] text-white p-8 mb-6 border-0 shadow-xl overflow-hidden relative">
          {/* Decorative background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
          </div>
          
          <div className="relative flex flex-col lg:flex-row items-start justify-between gap-8">
            <div className="flex-1 w-full">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center flex-shrink-0 ring-2 ring-white/30">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge className="bg-white/30 backdrop-blur-sm text-white border-white/40 hover:bg-white/40 transition-all">
                      World Bank Project
                    </Badge>
                  </div>
                  <h1 className="text-3xl lg:text-4xl font-bold mb-2 leading-tight">{project.project_name}</h1>
                  <p className="text-blue-100 text-sm">Project ID: {project.id}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                <Link 
                  href={`/country/${encodeURIComponent(project.country_name)}`}
                  className="group"
                >
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30 transition-all cursor-pointer">
                    <MapPin className="w-3 h-3 mr-1" />
                    {project.country_name}
                    <ExternalLink className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Badge>
                </Link>
                <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                  <Globe className="w-3 h-3 mr-1" />
                  {project.region_name}
                </Badge>
                {project.approval_fy && (
                  <Badge className="bg-white/20 backdrop-blur-sm text-white border-white/30">
                    <Calendar className="w-3 h-3 mr-1" />
                    FY {project.approval_fy}
                  </Badge>
                )}
              </div>
            </div>
            
            {/* Financial Summary Card */}
            <div className="bg-white/15 backdrop-blur-md rounded-xl p-6 min-w-[240px] border border-white/20 shadow-lg">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-green-200" />
                <p className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Total Commitment</p>
              </div>
              <p className="text-4xl font-bold mb-4 text-white drop-shadow-lg">
                {project.total_amount_formatted || formatCurrency(project.total_commitment)}
              </p>
              <div className="space-y-2">
                {project.ibrd_commitment > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-white/20">
                    <span className="text-sm text-blue-100">IBRD</span>
                    <span className="font-bold text-white">{formatCurrency(project.ibrd_commitment)}</span>
                  </div>
                )}
                {project.ida_commitment > 0 && (
                  <div className="flex justify-between items-center py-2 border-t border-white/20">
                    <span className="text-sm text-blue-100">IDA</span>
                    <span className="font-bold text-white">{formatCurrency(project.ida_commitment)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <Card className="bg-white border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-3">
                  <FileText className="w-5 h-5 text-[#0071bc]" />
                </div>
                Project Details
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-50/50 rounded-xl p-5 border border-blue-100 hover:border-blue-200 transition-colors">
                  <p className="text-xs text-stone-600 font-bold mb-2 uppercase tracking-wider">Status</p>
                  <Badge className={`${getStatusColor(project.status)} text-sm py-1 px-3`}>
                    {project.status}
                  </Badge>
                </div>
                
                {project.lending_instrument && (
                  <div className="bg-gradient-to-br from-stone-50 to-stone-50/50 rounded-xl p-5 border border-stone-200 hover:border-stone-300 transition-colors">
                    <p className="text-xs text-stone-600 font-bold mb-2 uppercase tracking-wider">Lending Instrument</p>
                    <p className="text-sm font-semibold text-stone-900">{project.lending_instrument}</p>
                  </div>
                )}
                
                {project.product_line && (
                  <div className="bg-gradient-to-br from-stone-50 to-stone-50/50 rounded-xl p-5 border border-stone-200 hover:border-stone-300 transition-colors">
                    <p className="text-xs text-stone-600 font-bold mb-2 uppercase tracking-wider">Product Line</p>
                    <p className="text-sm font-semibold text-stone-900">{project.product_line}</p>
                  </div>
                )}
                
                {project.approval_month && (
                  <div className="bg-gradient-to-br from-stone-50 to-stone-50/50 rounded-xl p-5 border border-stone-200 hover:border-stone-300 transition-colors">
                    <p className="text-xs text-stone-600 font-bold mb-2 uppercase tracking-wider">Approval Month</p>
                    <p className="text-sm font-semibold text-stone-900">{project.approval_month}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Timeline */}
            <Card className="bg-white border-stone-200 p-6 shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-2xl font-bold text-stone-900 mb-6 flex items-center">
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-3">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                Timeline
              </h2>
              
              <div className="space-y-6 relative">
                {/* Vertical line connecting timeline items */}
                {project.closing_date && (
                  <div className="absolute left-5 top-12 bottom-12 w-0.5 bg-gradient-to-b from-green-200 to-blue-200"></div>
                )}
                
                <div className="flex items-start gap-4 relative">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-green-50">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1 pt-1">
                    <p className="text-xs text-stone-600 font-bold mb-1 uppercase tracking-wider">Board Approval Date</p>
                    <p className="text-xl font-bold text-stone-900">{formatDate(project.board_approval_date)}</p>
                    <p className="text-sm text-stone-500 mt-1">Project officially approved</p>
                  </div>
                </div>
                
                {project.closing_date && (
                  <div className="flex items-start gap-4 relative">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0 shadow-lg ring-4 ring-blue-50">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div className="flex-1 pt-1">
                      <p className="text-xs text-stone-600 font-bold mb-1 uppercase tracking-wider">Closing Date</p>
                      <p className="text-xl font-bold text-stone-900">{formatDate(project.closing_date)}</p>
                      <p className="text-sm text-stone-500 mt-1">Expected project completion</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            {/* Sectors & Themes */}
            {(project.sectors?.length > 0 || project.themes?.length > 0) && (
              <Card className="bg-white border-stone-200 p-6">
                <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
                  <Target className="w-6 h-6 mr-2" />
                  Sectors & Themes
                </h2>
                
                {project.sectors?.length > 0 && (
                  <div className="mb-4">
                    <h3 className="font-semibold text-stone-900 mb-2">Sectors</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.sectors.map((sector: any, idx: number) => (
                        <Badge key={idx} className="bg-blue-50 text-blue-700 border-blue-200">
                          {typeof sector === 'string' ? sector : sector.name || 'Unknown'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.themes?.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-2">Themes</h3>
                    <div className="flex flex-wrap gap-2">
                      {project.themes.map((theme: any, idx: number) => (
                        <Badge key={idx} className="bg-purple-50 text-purple-700 border-purple-200">
                          {typeof theme === 'string' ? theme : theme.name || 'Unknown'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {project.major_theme && (
                  <div className="mt-4 p-3 bg-stone-50 rounded-lg border border-stone-200">
                    <p className="text-xs text-stone-600 mb-1">MAJOR THEME</p>
                    <p className="font-semibold text-stone-900">{project.major_theme}</p>
                  </div>
                )}
              </Card>
            )}

            {/* Documents & Resources */}
            {(documents.length > 0 || youtubeVideos.length > 0) && (
              <Card className="bg-white border-stone-200 p-6">
                <h2 className="text-2xl font-bold text-stone-900 mb-4 flex items-center">
                  <FileText className="w-6 h-6 mr-2" />
                  Documents & Resources
                </h2>
                
                {youtubeVideos.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                      <Youtube className="w-5 h-5 text-red-600" />
                      Video Resources
                    </h3>
                    <div className="space-y-2">
                      {youtubeVideos.map((video: any, idx: number) => (
                        <a
                          key={idx}
                          href={video.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors group"
                        >
                          <Play className="w-5 h-5 text-red-600" />
                          <div className="flex-1">
                            <p className="font-medium text-stone-900 group-hover:text-red-700">
                              {video.title || 'Video Resource'}
                            </p>
                            {video.date && (
                              <p className="text-xs text-stone-500">{video.date}</p>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-stone-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                
                {documents.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-stone-900 mb-3 flex items-center gap-2">
                      <Download className="w-5 h-5 text-blue-600" />
                      Project Documents
                    </h3>
                    <div className="space-y-2">
                      {documents.map((doc: any, idx: number) => (
                        <a
                          key={idx}
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors group"
                        >
                          <FileText className="w-5 h-5 text-blue-600" />
                          <div className="flex-1">
                            <p className="font-medium text-stone-900 group-hover:text-blue-700">
                              {doc.title || 'Project Document'}
                            </p>
                            {doc.date && (
                              <p className="text-xs text-stone-500">{doc.date}</p>
                            )}
                          </div>
                          <ExternalLink className="w-4 h-4 text-stone-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Team & Implementation */}
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Team & Implementation
              </h2>
              
              <div className="space-y-4">
                {project.team_lead && (
                  <div>
                    <p className="text-xs text-stone-600 mb-1">TEAM LEAD</p>
                    <p className="font-medium text-stone-900">{project.team_lead}</p>
                  </div>
                )}
                
                {project.implementing_agency && (
                  <div>
                    <p className="text-xs text-stone-600 mb-1">IMPLEMENTING AGENCY</p>
                    <p className="font-medium text-stone-900">{project.implementing_agency}</p>
                  </div>
                )}
                
                {project.borrower && (
                  <div>
                    <p className="text-xs text-stone-600 mb-1">BORROWER</p>
                    <p className="font-medium text-stone-900">{project.borrower}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Country Info */}
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Location
              </h2>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-stone-600 mb-1">COUNTRY</p>
                  <Link 
                    href={`/country/${encodeURIComponent(project.country_name)}`}
                    className="font-medium text-blue-600 hover:text-blue-700 hover:underline"
                  >
                    {project.country_name}
                  </Link>
                </div>
                
                <div>
                  <p className="text-xs text-stone-600 mb-1">REGION</p>
                  <p className="font-medium text-stone-900">{project.region_name}</p>
                </div>
                
                {project.country_code && (
                  <div>
                    <p className="text-xs text-stone-600 mb-1">COUNTRY CODE</p>
                    <p className="font-medium text-stone-900">{project.country_code}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* External Links */}
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center">
                <Globe className="w-5 h-5 mr-2" />
                External Links
              </h2>
              
              <div className="space-y-2">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  View on World Bank Website
                </a>
                
                <a
                  href={`https://projects.worldbank.org/en/projects-operations/project-detail/${project.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:underline"
                >
                  <ExternalLink className="w-4 h-4" />
                  Official Project Page
                </a>
              </div>
            </Card>

            {/* Data Source */}
            <Card className="bg-stone-50 border-stone-200 p-6">
              <h2 className="text-sm font-semibold text-stone-900 mb-3">Data Source</h2>
              <div className="space-y-2 text-xs text-stone-600">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600" />
                  <span>Verified Data</span>
                </div>
                <p>Source: {project.api_source}</p>
                {project.last_api_fetch && (
                  <p>Last Updated: {formatDate(project.last_api_fetch)}</p>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

