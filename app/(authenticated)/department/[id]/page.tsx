'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  ArrowLeft, 
  Users, 
  Target, 
  TrendingUp, 
  FileText, 
  Globe, 
  Briefcase,
  AlertCircle,
  CheckCircle,
  ExternalLink,
  Calendar,
  DollarSign,
  BarChart3,
  Phone
} from 'lucide-react';

interface DepartmentData {
  id: string;
  name: string;
  position: string;
  avatar_url?: string;
  bio: string;
  level: number;
  department: string;
  country?: string;
  tenure?: string;
  
  // Enhanced department data
  department_description?: string;
  department_mission?: string;
  department_vision?: string;
  role_responsibilities?: string[];
  strategic_priorities?: string[];
  key_initiatives?: string[];
  future_direction?: string;
  current_projects?: {
    [key: string]: string | number;
  };
  department_metrics?: {
    [key: string]: string | number;
  };
  team_size?: number;
  budget_allocation?: string;
  regional_coverage?: string[];
  sector_focus?: string[];
  recent_achievements?: string[];
  challenges?: string[];
  collaboration_partners?: string[];
  external_links?: {
    [key: string]: string;
  };
  quote?: string;
  speeches_references?: string[];
  documents_references?: string[];
  
  // Data quality
  data_verified?: boolean;
  last_verified_date?: string;
  verification_source?: string;
}

function TeamMembersList({ departmentId }: { departmentId: string }) {
  const [members, setMembers] = useState<DepartmentData[]>([]);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const response = await fetch('/api/worldbank-orgchart');
        if (response.ok) {
          const data = await response.json();
          const teamMembers = data.hierarchy.filter((m: DepartmentData) => m.parent_id === departmentId);
          setMembers(teamMembers);
        }
      } catch (error) {
        console.error('Error fetching team members:', error);
      }
    }
    fetchMembers();
  }, [departmentId]);

  if (members.length === 0) {
    return <p className="text-stone-600 text-sm">No direct reports</p>;
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {members.map((member) => {
        const initials = member.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
        return (
          <Link key={member.id} href={`/department/${member.id}`}>
            <Card className="bg-stone-50 border-stone-200 hover:shadow-md hover:border-[#0071bc] transition-all cursor-pointer">
              <div className="p-4 flex items-center gap-3">
                <Avatar className="w-12 h-12 ring-2 ring-stone-200">
                  <AvatarImage src={member.avatar_url} alt={member.name} />
                  <AvatarFallback className="bg-stone-200 text-stone-700 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-stone-900 text-sm truncate">{member.name}</h4>
                  <p className="text-xs text-stone-600 truncate">{member.position}</p>
                  {member.country && (
                    <Badge className="bg-stone-100 text-stone-600 border-stone-200 text-xs mt-1">
                      {member.country}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}

export default function DepartmentPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [department, setDepartment] = useState<DepartmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    async function fetchDepartment() {
      try {
        setLoading(true);
        const response = await fetch(`/api/worldbank-orgchart?action=member&id=${id}`);
        
        if (!response.ok) {
          throw new Error('Department not found');
        }
        
        const data = await response.json();
        setDepartment(data.member);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDepartment();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-stone-900 mx-auto mb-4"></div>
          <p className="text-stone-600">Loading department details...</p>
        </div>
      </div>
    );
  }

  if (error || !department) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-4">
        <Card className="bg-white border-stone-200 p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-stone-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-stone-900 mb-2">Department Not Found</h2>
          <p className="text-stone-600 mb-6">{error || 'The requested department could not be found.'}</p>
          <Button onClick={() => router.back()} className="bg-stone-900 hover:bg-stone-800">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </Card>
      </div>
    );
  }

  const initials = department.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="text-stone-600 hover:text-stone-900"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Org Chart
          </Button>
          
          {department.data_verified && (
            <Badge className="bg-stone-100 text-stone-700 border-stone-200">
              <CheckCircle className="w-3 h-3 mr-1" />
              Verified Data
            </Badge>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Profile Section */}
        <Card className="bg-white border-stone-200 p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="w-24 h-24 ring-2 ring-stone-200">
              <AvatarImage src={department.avatar_url} alt={department.name} />
              <AvatarFallback className="bg-stone-200 text-stone-700 text-2xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-1">
                    <h1 className="text-3xl font-semibold text-stone-900">{department.name}</h1>
                    
                    {/* Call AI Agent Button */}
                    {id === 'ajay-banga' ? (
                      <Link href="/rj-agent">
                        <Button className="bg-green-500 hover:bg-green-600 text-white">
                          <Phone className="w-4 h-4 mr-2" />
                          Call AI Agent
                        </Button>
                      </Link>
                    ) : (
                      <Button disabled className="bg-stone-200 text-stone-500 cursor-not-allowed">
                        <Phone className="w-4 h-4 mr-2" />
                        Coming Soon
                      </Button>
                    )}
                  </div>
                  <p className="text-lg text-stone-600 mb-2">{department.position}</p>
                  <div className="flex flex-wrap gap-2">
                    {department.country && (
                      <Badge className="bg-stone-100 text-stone-700 border-stone-200">
                        <Globe className="w-3 h-3 mr-1" />
                        {department.country}
                      </Badge>
                    )}
                    {department.tenure && (
                      <Badge className="bg-stone-100 text-stone-700 border-stone-200">
                        <Calendar className="w-3 h-3 mr-1" />
                        {department.tenure}
                      </Badge>
                    )}
                    <Badge className="bg-stone-100 text-stone-700 border-stone-200">
                      {department.department}
                    </Badge>
                  </div>
                </div>
              </div>
              
              {/* Personal Bio */}
              <div className="mb-4">
                <h3 className="font-semibold text-stone-900 mb-2">Biography</h3>
              <p className="text-stone-700 leading-relaxed">{department.bio}</p>
              </div>

              {/* Department Role Description */}
              {department.department_description && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <h3 className="font-semibold text-stone-900 mb-2">Role & Department Overview</h3>
                  <p className="text-stone-700 leading-relaxed">{department.department_description}</p>
                </div>
              )}
              
              {department.quote && (
                <blockquote className="mt-4 pl-4 border-l-4 border-[#0071bc] italic text-stone-600">
                  "{department.quote}"
                </blockquote>
              )}
            </div>
          </div>
        </Card>

        {/* Team Members - Moved to top */}
        {department.children_count && department.children_count > 0 && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <div className="mb-4">
              <h2 className="text-2xl font-bold text-stone-900 mb-2 flex items-center">
                <Users className="w-6 h-6 mr-2" />
                Team Members
              </h2>
              <p className="text-stone-600">
                Meet the {department.children_count} professionals on this team
              </p>
            </div>
            <TeamMembersList departmentId={department.id} />
          </Card>
        )}

        {/* Strategy & Vision */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {department.department_mission && (
            <Card className="bg-gradient-to-br from-[#0071bc] to-[#005a99] border-0 p-6">
              <h2 className="text-xl font-semibold text-white mb-3">Mission & Strategy</h2>
              <p className="text-blue-50 leading-relaxed">{department.department_mission}</p>
              </Card>
            )}
            
            {department.department_vision && (
              <Card className="bg-white border-stone-200 p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-3">Vision & Future Direction</h2>
                <p className="text-stone-700 leading-relaxed">{department.department_vision}</p>
              </Card>
            )}
          </div>

        {/* Future Direction */}
        {department.future_direction && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-3">Future Direction & Strategy</h2>
            <p className="text-stone-700 leading-relaxed">{department.future_direction}</p>
          </Card>
        )}

        {/* Key Numbers - Projects, Money, Employees */}
        {(department.department_metrics || department.current_projects || department.team_size || department.budget_allocation) && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
              <BarChart3 className="w-5 h-5 mr-2" />
              Key Numbers & Performance
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {department.team_size && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-stone-600 mb-1">Employees</p>
                  <p className="text-3xl font-bold text-[#0071bc]">{department.team_size.toLocaleString()}</p>
                </div>
              )}
              {department.budget_allocation && (
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <p className="text-sm text-stone-600 mb-1">Budget</p>
                  <p className="text-2xl font-bold text-[#0071bc]">{department.budget_allocation}</p>
                </div>
              )}
              {department.department_metrics && Object.entries(department.department_metrics).slice(0, 6).map(([key, value]) => (
                <div key={key} className="bg-stone-50 rounded-lg p-4">
                  <p className="text-sm text-stone-600 mb-1">
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </p>
                  <p className="text-2xl font-semibold text-stone-900">{value}</p>
                </div>
              ))}
            </div>
            
            {/* Current Projects */}
            {department.current_projects && Object.keys(department.current_projects).length > 0 && (
              <div className="pt-4 border-t border-stone-200">
                <h3 className="font-semibold text-stone-900 mb-3">Current Projects & Initiatives</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {Object.entries(department.current_projects).map(([key, value]) => (
                    <div key={key} className="bg-stone-50 rounded-lg p-3">
                      <p className="text-xs text-stone-600 mb-1">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </p>
                      <p className="text-lg font-semibold text-stone-900">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Strategic Priorities */}
        {department.strategic_priorities && department.strategic_priorities.length > 0 && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2" />
              Strategic Priorities
            </h2>
            <div className="grid sm:grid-cols-2 gap-3">
              {department.strategic_priorities.map((priority, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-stone-50 rounded-lg p-4">
                  <div className="w-6 h-6 rounded-full bg-stone-200 text-stone-700 flex items-center justify-center flex-shrink-0 text-sm font-semibold">
                    {idx + 1}
                  </div>
                  <p className="text-stone-800">{priority}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Key Initiatives */}
        {department.key_initiatives && department.key_initiatives.length > 0 && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Key Initiatives
            </h2>
            <div className="space-y-3">
              {department.key_initiatives.map((initiative, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-stone-400 flex-shrink-0 mt-0.5" />
                  <p className="text-stone-700">{initiative}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Role & Responsibilities */}
        {department.role_responsibilities && department.role_responsibilities.length > 0 && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Role & Responsibilities
            </h2>
            <ul className="space-y-2">
              {department.role_responsibilities.map((responsibility, idx) => (
                <li key={idx} className="flex items-start gap-3 text-stone-700">
                  <span className="text-stone-400 mt-1">•</span>
                  {responsibility}
                </li>
              ))}
            </ul>
          </Card>
        )}

        {/* Current Affairs & Recent Achievements */}
          {department.recent_achievements && department.recent_achievements.length > 0 && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
              Current Affairs & Recent Achievements
              </h2>
            <div className="space-y-4">
                {department.recent_achievements.map((achievement, idx) => (
                <div key={idx} className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-lg p-4">
                  <CheckCircle className="w-5 h-5 text-[#0071bc] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-stone-800 font-medium">{achievement}</p>
                  </div>
                </div>
                ))}
            </div>
            </Card>
          )}

        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Challenges */}
          {department.challenges && department.challenges.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                Current Challenges
              </h2>
              <ul className="space-y-3">
                {department.challenges.map((challenge, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-stone-700">
                    <span className="text-stone-400 mt-1">•</span>
                    {challenge}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        {/* Future Direction */}
        {department.future_direction && (
          <Card className="bg-stone-900 text-white border-stone-700 p-6 mb-6">
            <h2 className="text-xl font-semibold mb-3">Future Direction & Strategy</h2>
            <p className="text-stone-200 leading-relaxed">{department.future_direction}</p>
          </Card>
        )}

        {/* Additional Details Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Team & Budget */}
          <Card className="bg-white border-stone-200 p-6">
            <h3 className="font-semibold text-stone-900 mb-3">Department Overview</h3>
            <div className="space-y-3">
              {department.team_size && (
                <div>
                  <p className="text-sm text-stone-600">Team Size</p>
                  <p className="text-lg font-semibold text-stone-900">{department.team_size.toLocaleString()} staff</p>
                </div>
              )}
              {department.budget_allocation && (
                <div>
                  <p className="text-sm text-stone-600">Budget Allocation</p>
                  <p className="text-lg font-semibold text-stone-900">{department.budget_allocation}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Sectors */}
          {department.sector_focus && department.sector_focus.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-3">Sector Focus</h3>
              <div className="flex flex-wrap gap-2">
                {department.sector_focus.map((sector, idx) => (
                  <Badge key={idx} className="bg-stone-100 text-stone-700 border-stone-200">
                    {sector}
                  </Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Regions */}
          {department.regional_coverage && department.regional_coverage.length > 0 && (
            <Card className="bg-white border-stone-200 p-6">
              <h3 className="font-semibold text-stone-900 mb-3">Regional Coverage</h3>
              <div className="flex flex-wrap gap-2">
                {department.regional_coverage.map((region, idx) => (
                  <Badge key={idx} className="bg-stone-100 text-stone-700 border-stone-200">
                    <Globe className="w-3 h-3 mr-1" />
                    {region}
                  </Badge>
                ))}
              </div>
            </Card>
          )}
        </div>

        {/* References */}
        {((department.speeches_references && department.speeches_references.length > 0) ||
          (department.documents_references && department.documents_references.length > 0)) && (
          <Card className="bg-white border-stone-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-stone-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Sources & References
            </h2>
            
            {department.speeches_references && department.speeches_references.length > 0 && (
              <div className="mb-4">
                <h3 className="font-semibold text-stone-800 mb-2">Relevant Speeches</h3>
                <ul className="space-y-2">
                  {department.speeches_references.slice(0, 5).map((url, idx) => (
                    <li key={idx}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 flex items-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {new URL(url).pathname.split('/').pop()?.substring(0, 60)}...
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {department.documents_references && department.documents_references.length > 0 && (
              <div>
                <h3 className="font-semibold text-stone-800 mb-2">Strategy Documents</h3>
                <ul className="space-y-2">
                  {department.documents_references.slice(0, 5).map((url, idx) => (
                    <li key={idx}>
                      <a 
                        href={url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-stone-600 hover:text-stone-900 flex items-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-3 h-3" />
                        {new URL(url).pathname.split('/').pop()?.substring(0, 60)}...
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        )}

        {/* Data Quality Footer */}
        {department.data_verified && (
          <Card className="bg-stone-50 border-stone-200 p-4">
            <div className="flex items-center justify-between text-sm text-stone-600">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-stone-500" />
                <span>Data verified from official sources</span>
              </div>
              {department.last_verified_date && (
                <span>Last updated: {new Date(department.last_verified_date).toLocaleDateString()}</span>
              )}
            </div>
            {department.verification_source && (
              <p className="text-xs text-stone-500 mt-2">
                Source: {department.verification_source}
              </p>
            )}
          </Card>
        )}
      </div>
    </main>
  );
}

