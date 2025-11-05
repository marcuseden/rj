/**
 * World Bank Organizational Chart Database Integration
 *
 * Manages the organizational chart data stored in Supabase
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';

export interface OrgChartMember {
  id: string;
  name: string;
  position: string;
  avatar_url?: string;
  bio: string;
  level: number;
  parent_id?: string;
  reports_to?: string;
  country?: string;
  tenure?: string;
  education?: string[];
  department?: string;
  region?: string;
  function?: string;
  is_active: boolean;
  sort_order: number;
  children_count?: number;
}

export class WorldBankOrgChartDB {
  private supabase;

  constructor() {
    // Load environment variables
    dotenv.config({ path: path.join(process.cwd(), '.env.local') });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Get the complete organizational chart hierarchy
   */
  async getOrgChartHierarchy(): Promise<OrgChartMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart_hierarchy')
        .select('*');

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching org chart hierarchy:', error);
      throw error;
    }
  }

  /**
   * Get members by level
   */
  async getMembersByLevel(level: number): Promise<OrgChartMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart')
        .select('*')
        .eq('level', level)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching level ${level} members:`, error);
      throw error;
    }
  }

  /**
   * Get children of a specific member
   */
  async getMemberChildren(parentId: string): Promise<OrgChartMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart')
        .select('*')
        .eq('parent_id', parentId)
        .eq('is_active', true)
        .order('sort_order', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error(`Error fetching children of ${parentId}:`, error);
      throw error;
    }
  }

  /**
   * Get a specific member by ID
   */
  async getMemberById(id: string): Promise<OrgChartMember | null> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error(`Error fetching member ${id}:`, error);
      throw error;
    }
  }

  /**
   * Search members by name or position
   */
  async searchMembers(query: string): Promise<OrgChartMember[]> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart')
        .select('*')
        .eq('is_active', true)
        .or(`name.ilike.%${query}%,position.ilike.%${query}%`)
        .order('level', { ascending: true })
        .order('name', { ascending: true });

      if (error) {
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  }

  /**
   * Add or update a member
   */
  async upsertMember(member: Partial<OrgChartMember>): Promise<OrgChartMember> {
    try {
      const { data, error } = await this.supabase
        .from('worldbank_orgchart')
        .upsert(member, { onConflict: 'id' })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error upserting member:', error);
      throw error;
    }
  }

  /**
   * Deactivate a member (soft delete)
   */
  async deactivateMember(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('worldbank_orgchart')
        .update({ is_active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error(`Error deactivating member ${id}:`, error);
      throw error;
    }
  }

  /**
   * Get statistics about the org chart
   */
  async getStats(): Promise<{
    totalMembers: number;
    activeMembers: number;
    levels: number;
    departments: string[];
  }> {
    try {
      const { data: allMembers, error: allError } = await this.supabase
        .from('worldbank_orgchart')
        .select('level, department, is_active');

      if (allError) {
        throw allError;
      }

      const members = allMembers || [];
      const activeMembers = members.filter(m => m.is_active);

      const levels = [...new Set(activeMembers.map(m => m.level))].length;
      const departments = [...new Set(activeMembers.map(m => m.department).filter(Boolean))];

      return {
        totalMembers: members.length,
        activeMembers: activeMembers.length,
        levels,
        departments
      };
    } catch (error) {
      console.error('Error getting org chart stats:', error);
      throw error;
    }
  }
}
