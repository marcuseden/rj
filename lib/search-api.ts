// API client functions for optimized search

import { SearchResponse, SearchFilters, SearchParams, OrgChartResponse } from './search-types';

const API_BASE = '/api';

/**
 * Fetch search results with pagination and filtering
 */
export async function fetchSearchResults(params: SearchParams = {}): Promise<SearchResponse> {
  const searchParams = new URLSearchParams();
  
  if (params.q) searchParams.set('q', params.q);
  if (params.type && params.type !== 'all') searchParams.set('type', params.type);
  if (params.region && params.region !== 'all') searchParams.set('region', params.region);
  if (params.sector && params.sector !== 'all') searchParams.set('sector', params.sector);
  if (params.author && params.author !== 'all') searchParams.set('author', params.author);
  if (params.department && params.department !== 'all') searchParams.set('department', params.department);
  if (params.page) searchParams.set('page', params.page.toString());
  if (params.limit) searchParams.set('limit', params.limit.toString());
  
  const url = `${API_BASE}/search?${searchParams.toString()}`;
  console.log('🔍 Fetching search results:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Search API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch available filter options (cached)
 */
export async function fetchSearchFilters(): Promise<SearchFilters> {
  const url = `${API_BASE}/search/filters`;
  console.log('🎛️ Fetching search filters:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Filters API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Fetch org chart with optional level/parent filtering
 */
export async function fetchOrgChart(params?: { level?: number; parentId?: string }): Promise<OrgChartResponse> {
  const searchParams = new URLSearchParams();
  
  if (params?.level !== undefined) searchParams.set('level', params.level.toString());
  if (params?.parentId) searchParams.set('parentId', params.parentId);
  
  const url = `${API_BASE}/orgchart${searchParams.toString() ? '?' + searchParams.toString() : ''}`;
  console.log('🏢 Fetching org chart:', url);
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`Orgchart API error: ${response.status}`);
  }
  
  const data = await response.json();
  return data;
}

/**
 * Build SWR cache key for search
 */
export function buildSearchCacheKey(params: SearchParams): string {
  const parts = ['search'];
  
  if (params.q) parts.push(`q:${params.q}`);
  if (params.type && params.type !== 'all') parts.push(`type:${params.type}`);
  if (params.region && params.region !== 'all') parts.push(`region:${params.region}`);
  if (params.sector && params.sector !== 'all') parts.push(`sector:${params.sector}`);
  if (params.author && params.author !== 'all') parts.push(`author:${params.author}`);
  if (params.department && params.department !== 'all') parts.push(`dept:${params.department}`);
  parts.push(`page:${params.page || 1}`);
  parts.push(`limit:${params.limit || 20}`);
  
  return parts.join('|');
}

/**
 * Simple in-memory cache for filter options
 */
let filtersCache: { data: SearchFilters | null; timestamp: number } = {
  data: null,
  timestamp: 0
};

const FILTERS_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

export function getCachedFilters(): SearchFilters | null {
  if (!filtersCache.data) return null;
  
  const age = Date.now() - filtersCache.timestamp;
  if (age > FILTERS_CACHE_TTL) {
    return null;
  }
  
  return filtersCache.data;
}

export function setCachedFilters(data: SearchFilters): void {
  filtersCache = {
    data,
    timestamp: Date.now()
  };
}


