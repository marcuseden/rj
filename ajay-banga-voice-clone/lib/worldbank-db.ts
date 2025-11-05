/**
 * World Bank Document Database Integration
 * 
 * Saves scraped documents to Supabase with full indexing and tagging
 */

import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import type { WorldBankDocument } from './worldbank-knowledge';

// Extended type for database storage
interface WorldBankDocumentDB extends Omit<WorldBankDocument, 'tags' | 'sourceReference' | 'metadata'> {
  // Flatten complex objects for database storage
  tags_document_type: string;
  tags_content_type: string;
  tags_audience: string[];
  tags_regions: string[];
  tags_sectors: string[];
  tags_initiatives: string[];
  tags_authors: string[];
  tags_departments: string[];
  tags_priority: string;
  tags_status: string;
  
  source_original_url: string;
  source_scraped_from: string;
  source_parent_page?: string;
  source_link_text?: string;
  source_discovered_at: string;
  source_type: string;
  
  metadata_language: string;
  metadata_word_count: number;
  metadata_reading_time: number;
  metadata_last_modified?: string;
}

export class WorldBankDB {
  public supabase;

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
   * Create database table for World Bank documents
   * Note: You may need to run this SQL manually in Supabase dashboard
   */
  async createTable(): Promise<void> {
    console.log('📋 Table should already exist in Supabase');
    console.log('⚠️  If you get schema cache errors, reload the schema in Supabase dashboard');
    return;
  }

  /**
   * Save a document to the database
   */
  async saveDocument(doc: any): Promise<void> {
    const dbDoc: any = {
      id: doc.id,
      title: doc.title,
      url: doc.url,
      content: doc.content,
      summary: doc.summary,
      date: doc.date,
      type: doc.type,
      file_type: doc.fileType,
      file_size: doc.fileSize,
      local_path: doc.localPath,
      
      topics: doc.topics,
      keywords: doc.keywords,
      citations: doc.citations || [],
      related_documents: doc.relatedDocuments || [],
      
      // Tags
      tags_document_type: doc.tags.documentType,
      tags_content_type: doc.tags.contentType,
      tags_audience: doc.tags.audience,
      tags_regions: doc.tags.regions,
      tags_sectors: doc.tags.sectors,
      tags_initiatives: doc.tags.initiatives,
      tags_authors: doc.tags.authors,
      tags_departments: doc.tags.departments,
      tags_priority: doc.tags.priority,
      tags_status: doc.tags.status,
      
      // Source reference
      source_original_url: doc.sourceReference.originalUrl,
      source_scraped_from: doc.sourceReference.scrapedFrom,
      source_parent_page: doc.sourceReference.parentPage,
      source_link_text: doc.sourceReference.linkText,
      source_discovered_at: doc.sourceReference.discoveredAt,
      source_type: doc.sourceReference.sourceType,
      
      // Metadata
      metadata_language: doc.metadata.language,
      metadata_word_count: doc.metadata.wordCount,
      metadata_reading_time: doc.metadata.readingTime,
      metadata_last_modified: doc.metadata.lastModified,
      
      scraped_at: doc.scrapedAt
    };
    
    const { error } = await this.supabase
      .from('worldbank_documents')
      .upsert(dbDoc);
    
    if (error) {
      console.error(`❌ Error saving document ${doc.id}:`, error);
      throw error;
    }
  }

  /**
   * Save multiple documents
   */
  async saveDocuments(docs: any[]): Promise<void> {
    console.log(`💾 Saving ${docs.length} documents to database...`);
    
    for (const doc of docs) {
      try {
        await this.saveDocument(doc);
        console.log(`  ✅ Saved: ${doc.title.substring(0, 50)}...`);
      } catch (error) {
        console.error(`  ❌ Failed: ${doc.title}`);
      }
    }
    
    console.log('✅ All documents saved to database');
  }

  /**
   * Search documents by tags
   */
  async searchByTags(filters: {
    documentType?: string;
    sectors?: string[];
    initiatives?: string[];
    authors?: string[];
    priority?: string;
    minDate?: string;
  }): Promise<any[]> {
    let query = this.supabase.from('worldbank_documents').select('*');
    
    if (filters.documentType) {
      query = query.eq('tags_document_type', filters.documentType);
    }
    if (filters.sectors && filters.sectors.length > 0) {
      query = query.contains('tags_sectors', filters.sectors);
    }
    if (filters.initiatives && filters.initiatives.length > 0) {
      query = query.contains('tags_initiatives', filters.initiatives);
    }
    if (filters.authors && filters.authors.length > 0) {
      query = query.contains('tags_authors', filters.authors);
    }
    if (filters.priority) {
      query = query.eq('tags_priority', filters.priority);
    }
    if (filters.minDate) {
      query = query.gte('date', filters.minDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  /**
   * Full text search
   */
  async fullTextSearch(searchQuery: string, limit: number = 10): Promise<any[]> {
    const { data, error } = await this.supabase.rpc('search_worldbank_documents', {
      search_query: searchQuery,
      result_limit: limit
    });
    
    if (error) {
      console.warn('Full text search not available, using basic search');
      // Fallback to basic search
      const { data: fallbackData } = await this.supabase
        .from('worldbank_documents')
        .select('*')
        .or(`title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`)
        .limit(limit);
      
      return fallbackData || [];
    }
    
    return data || [];
  }

  /**
   * Get document by ID with full source reference
   */
  async getDocument(id: string): Promise<any | null> {
    const { data, error } = await this.supabase
      .from('worldbank_documents')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return null;
    return data;
  }

  /**
   * Get statistics
   */
  async getStats(): Promise<any> {
    const { data, error } = await this.supabase
      .from('worldbank_documents')
      .select('type, tags_document_type, tags_priority, date');
    
    if (error) throw error;
    
    // Aggregate stats
    const stats = {
      total: data.length,
      byType: {} as Record<string, number>,
      byDocType: {} as Record<string, number>,
      byPriority: {} as Record<string, number>,
      dateRange: {
        earliest: data[0]?.date,
        latest: data[0]?.date
      }
    };
    
    data.forEach(d => {
      stats.byType[d.type] = (stats.byType[d.type] || 0) + 1;
      stats.byDocType[d.tags_document_type] = (stats.byDocType[d.tags_document_type] || 0) + 1;
      stats.byPriority[d.tags_priority] = (stats.byPriority[d.tags_priority] || 0) + 1;
      
      if (d.date < stats.dateRange.earliest) stats.dateRange.earliest = d.date;
      if (d.date > stats.dateRange.latest) stats.dateRange.latest = d.date;
    });
    
    return stats;
  }
}

