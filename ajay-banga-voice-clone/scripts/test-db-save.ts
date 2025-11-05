/**
 * Test Database Save Functionality
 */

import { WorldBankDB } from '../lib/worldbank-db.ts';

async function testDatabaseSave() {
  console.log('🧪 TESTING DATABASE SAVE FUNCTIONALITY');
  console.log('=====================================');

  const db = new WorldBankDB();

  // Test document
  const testDoc = {
    id: `test-doc-${Date.now()}`,
    title: 'Test World Bank Document - Health Sector Analysis',
    url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/test123',
    content: 'This is a comprehensive analysis of health sector development challenges and opportunities in developing countries. The document examines current trends, policy frameworks, and strategic recommendations for improving health outcomes. Key areas covered include healthcare infrastructure, medical workforce development, pharmaceutical access, and health financing mechanisms. The analysis draws on global best practices and provides actionable recommendations for policymakers.',
    summary: 'Comprehensive analysis of health sector development challenges and strategic recommendations for improving health outcomes in developing countries.',
    date: '2024-11-04',
    type: 'policy-research-working-paper',
    file_type: 'html',
    file_size: 2500,
    local_path: null,
    topics: ['health', 'development', 'policy'],
    keywords: ['health', 'healthcare', 'development', 'policy', 'infrastructure'],
    citations: [],
    related_documents: [],
    tags_document_type: 'policy-research-working-paper',
    tags_content_type: 'policy-research-working-paper',
    tags_audience: ['general'],
    tags_regions: ['Global'],
    tags_sectors: ['Health'],
    tags_initiatives: ['World Bank Development'],
    tags_authors: ['World Bank'],
    tags_departments: ['Health, Nutrition and Population'],
    tags_priority: 'standard',
    tags_status: 'verified',
    source_original_url: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/test123',
    source_scraped_from: 'https://documents.worldbank.org/en/publication/documents-reports/documentdetail/test123',
    source_parent_page: null,
    source_link_text: 'Test World Bank Document - Health Sector Analysis',
    source_discovered_at: new Date().toISOString(),
    source_type: 'validated',
    metadata_language: 'en',
    metadata_word_count: 85,
    metadata_reading_time: 1,
    metadata_last_modified: null,
    scraped_at: new Date().toISOString()
  };

  try {
    console.log('📊 Attempting to save test document...');
    console.log(`📄 Title: ${testDoc.title}`);
    console.log(`🌐 URL: ${testDoc.url}`);
    console.log(`📅 Date: ${testDoc.date}`);
    console.log('');

    await db.saveDocument(testDoc);

    console.log('✅ SUCCESS: Document saved to database!');
    console.log('🎉 Database functionality confirmed working');

    // Verify it was saved
    const saved = await db.supabase
      .from('worldbank_documents')
      .select('id, title')
      .eq('id', testDoc.id)
      .single();

    if (saved.data) {
      console.log('✅ VERIFIED: Document found in database');
      console.log(`📊 Database ID: ${saved.data.id}`);
      console.log(`📄 Saved Title: ${saved.data.title}`);
    } else {
      console.log('❌ VERIFICATION FAILED: Document not found in database');
    }

  } catch (error) {
    console.log('❌ FAILED: Database save error');
    console.log(`Error: ${error.message}`);
    console.log('Full error:', error);
  }
}

testDatabaseSave();


