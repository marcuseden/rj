// Shared types for optimized search

export interface SearchDocument {
  id: string;
  title: string;
  summary: string;
  date: string;
  sourceType: 'speech' | 'strategy' | 'department' | 'geographic' | 'general' | 'country' | 'person' | 'project';
  tags: {
    documentType: string;
    authors: string[];
    sectors: string[];
    regions: string[];
    departments: string[];
    initiatives?: string[];
    priority: string;
    contentType?: string;
    audience?: string[];
  };
  metadata: {
    readingTime: number;
    wordCount: number;
  };
}

export interface SearchFilters {
  authors: string[];
  documentTypes: string[];
  sectors: string[];
  regions: string[];
  departments: string[];
  sourceTypes: {
    all: number;
    country: number;
    person: number;
    project: number;
    speech?: number;
    strategy?: number;
    department?: number;
  };
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface SearchResponse {
  results: SearchDocument[];
  pagination: SearchPagination;
}

export interface SearchParams {
  q?: string;
  type?: string;
  region?: string;
  sector?: string;
  author?: string;
  department?: string;
  page?: number;
  limit?: number;
}

export interface OrgMember {
  id: string;
  name: string;
  position: string;
  avatar_url?: string;
  bio: string;
  level: number;
  department: string;
  parent_id?: string;
  children_count?: number;
  region?: string;
  function?: string;
  is_active?: boolean;
}

export interface OrgChartResponse {
  hierarchy: OrgMember[];
  count: number;
}


