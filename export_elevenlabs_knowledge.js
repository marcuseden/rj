#!/usr/bin/env node

/**
 * Export comprehensive knowledge base from Supabase for ElevenLabs Agent
 * Combines speeches, projects, and World Bank data into a formatted knowledge base
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Get Supabase credentials from environment
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials');
  console.error('Make sure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportKnowledgeBase() {
  console.log('🚀 Starting ElevenLabs Knowledge Base Export...\n');
  
  let knowledge = {
    version: '1.0',
    generated_at: new Date().toISOString(),
    source: 'World Bank Database + Ajay Banga Speeches',
    sections: []
  };

  // 1. AJAY BANGA PROFILE & STYLE
  console.log('📝 Section 1: Ajay Banga Profile & Speaking Style');
  const styleGuide = require('./public/banga_style_guide.json');
  
  knowledge.sections.push({
    title: 'AJAY BANGA - SPEAKING STYLE & CHARACTERISTICS',
    content: `
Ajay Banga is the 14th President of the World Bank Group (since June 2, 2023).

SPEAKING STYLE:
- Direct, action-oriented language with emphasis on measurable results
- Data-driven arguments with specific numbers and concrete facts
- Focus on collaboration between governments, private sector, and development banks
- Consistent themes: development finance, partnerships, reform, jobs, climate, energy
- Signature phrases: "forecasts are not destiny", "journeys are fueled by hope, they are realized by deeds"
- Professional but accessible tone with calls to action emphasizing collective effort

KEY PRIORITIES:
1. Job creation - addressing the challenge of 1.2 billion young people entering workforce by 2035
2. Energy access - Mission 300 (bringing electricity to 300 million Africans by 2030)
3. Climate resilience - 45% of World Bank funding toward climate projects
4. Healthcare access - quality care for 1.5 billion people by 2030
5. Private sector mobilization - using guarantees and de-risking to attract investment
6. IDA replenishment - securing record $100+ billion for poorest countries
7. Reform and efficiency - "Better Bank" initiative cutting approval times by one-third

COMMON VOCABULARY & PHRASES:
${JSON.stringify(styleGuide.vocabulary?.slice(0, 50), null, 2)}

TOP 3-WORD PHRASES:
${styleGuide.common_phrases?.['3_word']?.slice(0, 20).map(p => `- "${p.phrase}" (used ${p.count} times)`).join('\n')}
`
  });

  // 2. SPEECHES DATABASE
  console.log('📝 Section 2: Ajay Banga Speeches (14 speeches)');
  const speechesDb = require('./public/speeches_database.json');
  
  let speechesContent = `\n=== AJAY BANGA SPEECHES (${speechesDb.total_speeches} speeches, ${speechesDb.total_words.toLocaleString()} words) ===\n\n`;
  
  for (const speech of speechesDb.speeches || []) {
    speechesContent += `\n--- SPEECH ${speech.id}: ${speech.title} ---\n`;
    speechesContent += `${speech.full_text}\n\n`;
  }
  
  knowledge.sections.push({
    title: 'AJAY BANGA SPEECHES COLLECTION',
    content: speechesContent
  });

  // 3. WORLD BANK PROJECTS
  console.log('📝 Section 3: World Bank Projects');
  const { data: projects, error: projectsError, count: projectCount } = await supabase
    .from('worldbank_projects')
    .select('*', { count: 'exact' })
    .order('approval_date', { ascending: false })
    .limit(500); // Top 500 most recent projects

  if (projectsError) {
    console.warn('⚠️  Could not fetch projects:', projectsError.message);
  } else {
    console.log(`   ✅ Found ${projectCount} projects (exporting top 500)`);
    
    let projectsContent = `\n=== WORLD BANK PROJECTS (${projectCount} total projects) ===\n\n`;
    projectsContent += `Top 500 most recent projects for context:\n\n`;
    
    for (const project of projects || []) {
      projectsContent += `
PROJECT: ${project.project_name}
Country: ${project.country_name}
Sector: ${project.sector}
Status: ${project.status}
Total Commitment: $${(project.total_commitment || 0).toLocaleString()}
Approval Date: ${project.approval_date}
Description: ${project.project_abstract?.substring(0, 300)}...
${project.project_development_objective ? `Objective: ${project.project_development_objective.substring(0, 200)}...` : ''}
---
`;
    }
    
    knowledge.sections.push({
      title: 'WORLD BANK PROJECTS DATABASE',
      content: projectsContent
    });
  }

  // 4. WORLD BANK DOCUMENTS & SPEECHES FROM DB
  console.log('📝 Section 4: World Bank Documents');
  const { data: documents, error: docsError, count: docsCount } = await supabase
    .from('worldbank_documents')
    .select('*', { count: 'exact' })
    .order('date', { ascending: false })
    .limit(100); // Top 100 documents

  if (docsError) {
    console.warn('⚠️  Could not fetch documents:', docsError.message);
  } else {
    console.log(`   ✅ Found ${docsCount} documents (exporting top 100)`);
    
    let docsContent = `\n=== WORLD BANK DOCUMENTS (${docsCount} total) ===\n\n`;
    
    for (const doc of documents || []) {
      docsContent += `
DOCUMENT: ${doc.title}
Type: ${doc.type} | Date: ${doc.date}
${doc.summary ? `Summary: ${doc.summary}\n` : ''}
Content: ${doc.content?.substring(0, 500)}...
Topics: ${doc.topics?.join(', ')}
Keywords: ${doc.keywords?.join(', ')}
---
`;
    }
    
    knowledge.sections.push({
      title: 'WORLD BANK DOCUMENTS & STRATEGY PAPERS',
      content: docsContent
    });
  }

  // 5. COUNTRY & ECONOMIC DATA
  console.log('📝 Section 5: Country & Economic Data');
  const { data: countries, error: countriesError, count: countryCount } = await supabase
    .from('countries_info')
    .select('*', { count: 'exact' })
    .limit(100);

  if (countriesError) {
    console.warn('⚠️  Could not fetch countries:', countriesError.message);
  } else {
    console.log(`   ✅ Found ${countryCount} countries`);
    
    let countriesContent = `\n=== WORLD BANK COUNTRY DATA (${countryCount} countries) ===\n\n`;
    
    for (const country of countries || []) {
      countriesContent += `${country.country_name}: `;
      countriesContent += `Region: ${country.region}, `;
      countriesContent += `Income Level: ${country.income_level}, `;
      countriesContent += `Population: ${country.population?.toLocaleString() || 'N/A'}, `;
      countriesContent += `GDP: $${country.gdp_current_usd ? (country.gdp_current_usd / 1e9).toFixed(1) + 'B' : 'N/A'}\n`;
    }
    
    knowledge.sections.push({
      title: 'COUNTRY & ECONOMIC DATA',
      content: countriesContent
    });
  }

  // Generate the final knowledge base document
  console.log('\n📄 Generating knowledge base document...');
  
  let finalDocument = `# AJAY BANGA / WORLD BANK GROUP - COMPREHENSIVE KNOWLEDGE BASE
Generated: ${knowledge.generated_at}
Source: ${knowledge.source}

This knowledge base contains everything about Ajay Banga's leadership, speaking style, 
World Bank projects, strategic documents, and global economic data.

`;

  for (const section of knowledge.sections) {
    finalDocument += `\n\n${'='.repeat(80)}\n`;
    finalDocument += `${section.title}\n`;
    finalDocument += `${'='.repeat(80)}\n`;
    finalDocument += section.content;
  }

  // Save outputs
  const outputDir = './elevenlabs-knowledge';
  await fs.mkdir(outputDir, { recursive: true });
  
  // Save as text file (primary format for ElevenLabs)
  await fs.writeFile(
    path.join(outputDir, 'knowledge_base.txt'),
    finalDocument,
    'utf-8'
  );
  
  // Save as JSON (for programmatic access)
  await fs.writeFile(
    path.join(outputDir, 'knowledge_base.json'),
    JSON.stringify(knowledge, null, 2),
    'utf-8'
  );

  // Create a condensed version (for token limits)
  const condensed = {
    ...knowledge,
    sections: knowledge.sections.map(s => ({
      ...s,
      content: s.content.substring(0, 5000) + (s.content.length > 5000 ? '\n...(truncated)' : '')
    }))
  };
  
  await fs.writeFile(
    path.join(outputDir, 'knowledge_base_condensed.json'),
    JSON.stringify(condensed, null, 2),
    'utf-8'
  );

  console.log('\n✅ Export Complete!');
  console.log(`\nFiles created in: ${outputDir}/`);
  console.log('  - knowledge_base.txt (main file for ElevenLabs)');
  console.log('  - knowledge_base.json (full structured data)');
  console.log('  - knowledge_base_condensed.json (shorter version)');
  
  console.log('\n📊 SUMMARY:');
  console.log(`  - Speeches: ${speechesDb.total_speeches}`);
  console.log(`  - Projects: ${projectCount || 'N/A'}`);
  console.log(`  - Documents: ${docsCount || 'N/A'}`);
  console.log(`  - Countries: ${countryCount || 'N/A'}`);
  console.log(`  - Total size: ${(finalDocument.length / 1024).toFixed(1)} KB`);
  
  console.log('\n📋 NEXT STEPS:');
  console.log('1. Go to https://elevenlabs.io/app/conversational-ai');
  console.log(`2. Select your agent (ID: agent_2101k94jg1rpfef8hrt86n3qrm5q)`);
  console.log('3. Click "Knowledge Base" section');
  console.log('4. Upload: elevenlabs-knowledge/knowledge_base.txt');
  console.log('5. Save and test your agent!');
  
  return knowledge;
}

// Run export
exportKnowledgeBase()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  });

