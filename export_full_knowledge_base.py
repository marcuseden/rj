#!/usr/bin/env python3
"""
Export COMPREHENSIVE knowledge base from Supabase database for ElevenLabs Agent
Pulls ALL content: speeches, documents, projects, countries, leadership, strategy docs
"""

import json
import os
from datetime import datetime
from pathlib import Path
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

SUPABASE_URL = os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_SERVICE_ROLE_KEY')

def get_supabase_client() -> Client:
    """Create Supabase client"""
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise Exception("Missing Supabase credentials in .env.local")
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def fetch_speeches(supabase: Client):
    """Fetch all RJ Banga speeches from database"""
    print("📝 Fetching speeches from database...")
    try:
        response = supabase.table('speeches').select('*').order('date', desc=True).execute()
        speeches = response.data
        print(f"   ✅ Loaded {len(speeches)} speeches from database")
        return speeches
    except Exception as e:
        print(f"   ⚠️  Could not load speeches from DB: {e}")
        return []

def fetch_documents(supabase: Client):
    """Fetch all World Bank documents from database"""
    print("📄 Fetching documents from database...")
    try:
        response = supabase.table('worldbank_documents').select('*').order('date', desc=True).limit(100).execute()
        documents = response.data
        print(f"   ✅ Loaded {len(documents)} documents from database")
        return documents
    except Exception as e:
        print(f"   ⚠️  Could not load documents from DB: {e}")
        return []

def fetch_projects(supabase: Client):
    """Fetch World Bank projects from database"""
    print("🏗️ Fetching projects from database...")
    try:
        response = supabase.table('worldbank_projects').select('*').order('approval_date', desc=True).limit(50).execute()
        projects = response.data
        print(f"   ✅ Loaded {len(projects)} projects from database")
        return projects
    except Exception as e:
        print(f"   ⚠️  Could not load projects from DB: {e}")
        return []

def fetch_countries(supabase: Client):
    """Fetch country data from database"""
    print("🌍 Fetching countries from database...")
    try:
        response = supabase.table('worldbank_countries').select('*').order('name').limit(50).execute()
        countries = response.data
        print(f"   ✅ Loaded {len(countries)} countries from database")
        return countries
    except Exception as e:
        print(f"   ⚠️  Could not load countries from DB: {e}")
        return []

def fetch_leadership(supabase: Client):
    """Fetch World Bank leadership from database"""
    print("👥 Fetching leadership team from database...")
    try:
        response = supabase.table('worldbank_leadership').select('*').order('name').execute()
        leadership = response.data
        print(f"   ✅ Loaded {len(leadership)} leadership members from database")
        return leadership
    except Exception as e:
        print(f"   ⚠️  Could not load leadership from DB: {e}")
        return []

def fetch_priorities(supabase: Client):
    """Fetch strategic priorities from database"""
    print("🎯 Fetching priorities from database...")
    try:
        response = supabase.table('worldbank_priorities').select('*').order('order_index').execute()
        priorities = response.data
        print(f"   ✅ Loaded {len(priorities)} priorities from database")
        return priorities
    except Exception as e:
        print(f"   ⚠️  Could not load priorities from DB: {e}")
        return []

def fetch_departments(supabase: Client):
    """Fetch World Bank departments from database"""
    print("🏢 Fetching departments from database...")
    try:
        response = supabase.table('worldbank_departments').select('*').order('name').execute()
        departments = response.data
        print(f"   ✅ Loaded {len(departments)} departments from database")
        return departments
    except Exception as e:
        print(f"   ⚠️  Could not load departments from DB: {e}")
        return []

def load_local_files():
    """Load additional context from local files"""
    print("📁 Loading local files...")
    
    context = {}
    
    # Load style guide
    try:
        with open('public/banga_style_guide.json', 'r', encoding='utf-8') as f:
            context['style_guide'] = json.load(f)
        print("   ✅ Loaded style guide")
    except Exception as e:
        print(f"   ⚠️  Could not load style guide: {e}")
    
    # Load speeches database (backup)
    try:
        with open('public/speeches_database.json', 'r', encoding='utf-8') as f:
            context['speeches_backup'] = json.load(f)
        print("   ✅ Loaded speeches backup")
    except Exception as e:
        print(f"   ⚠️  Could not load speeches backup: {e}")
    
    # Load verified documents
    try:
        with open('data/worldbank-strategy/ajay-banga-documents-verified.json', 'r', encoding='utf-8') as f:
            context['verified_docs'] = json.load(f)
        print("   ✅ Loaded verified documents")
    except Exception as e:
        print(f"   ⚠️  Could not load verified documents: {e}")
    
    return context

def generate_knowledge_sections(db_data, local_data):
    """Generate all knowledge base sections"""
    sections = []
    
    # SECTION 1: RJ BANGA PROFILE & SPEAKING STYLE
    print("\n📝 Generating Section 1: RJ Banga Profile...")
    style_guide = local_data.get('style_guide', {})
    
    # Handle vocabulary - it might be a list or object
    vocabulary_raw = style_guide.get('vocabulary', [])
    if isinstance(vocabulary_raw, list):
        vocabulary_list = vocabulary_raw[:100]
    elif isinstance(vocabulary_raw, dict):
        vocabulary_list = list(vocabulary_raw.keys())[:100] if vocabulary_raw else []
    else:
        vocabulary_list = []
    
    vocabulary_str = '\n'.join([f"- {word}" for word in vocabulary_list]) if vocabulary_list else "- development\n- partnership\n- climate\n- jobs"
    
    phrases_3word = style_guide.get('common_phrases', {}).get('3_word', [])[:30]
    phrases_str = '\n'.join([f"- \"{p['phrase']}\" (used {p['count']} times)" for p in phrases_3word])
    
    sections.append({
        'title': 'AJAY BANGA (RJ BANGA) - PROFILE & SPEAKING STYLE',
        'content': f"""
Ajay Banga is the 14th President of the World Bank Group (since June 2, 2023).

BACKGROUND:
- Former CEO of Mastercard (2010-2021)
- Born in India, educated at St. Stephen's College, Delhi and IIM Ahmedabad
- Vice Chairman at General Atlantic (2021-2023)
- Known for public-private partnerships and inclusive growth focus

SPEAKING STYLE CHARACTERISTICS:
- Direct, action-oriented language with emphasis on measurable results
- Data-driven arguments with specific numbers and concrete facts
- Focus on collaboration between governments, private sector, and development banks
- Consistent themes: development finance, partnerships, reform, jobs, climate, energy
- Signature phrases: "forecasts are not destiny", "journeys are fueled by hope, they are realized by deeds"
- Professional but accessible tone with calls to action emphasizing collective effort
- Uses personal stories and concrete examples (e.g., "mini-grids in Nigeria cut farmers' work time in half")
- Emphasizes speed, urgency, and accountability

KEY STRATEGIC PRIORITIES (from actual speeches):
1. Job Creation - addressing the challenge of 1.2 billion young people entering workforce by 2035
   - Only 420 million jobs projected; need 800 million more
   - Explicit focus on youth employment in every initiative

2. Energy Access - Mission 300
   - Bringing electricity to 300 million Africans by 2030
   - Focus on renewable energy and mini-grids
   - Target: 90 million connections in first phase

3. Climate Resilience - 45% of World Bank funding toward climate projects
   - $40+ billion annually in climate finance by 2025
   - Focus on adaptation and resilience, not just mitigation
   - Country Climate and Development Reports (CCDRs) for every country

4. Healthcare Access - quality care for 1.5 billion people by 2030
   - Primary healthcare as foundation
   - Pandemic preparedness (PPR Fund)
   - Health system strengthening

5. Private Sector Mobilization
   - Using guarantees and de-risking to attract investment
   - $150+ billion in private sector commitments secured
   - Focus on blended finance and innovative instruments

6. IDA Replenishment - securing record $100+ billion for poorest countries
   - IDA21: Record $93 billion secured (December 2024)
   - Largest replenishment ever
   - Pay-for-performance approach

7. Reform and Efficiency - "Better Bank" initiative
   - Cutting approval times by one-third
   - Scorecard reduced from 153 to 22 metrics
   - Focus on speed and impact

8. Food Security - $9 billion annually by 2030
   - Support for smallholder farmers
   - Agribusiness ecosystem development
   - Focus on sustainable agriculture

COMMON VOCABULARY (from {len(vocabulary_list)} analyzed words):
{vocabulary_str}

TOP 3-WORD PHRASES (from speech analysis):
{phrases_str}

COMMUNICATION PATTERNS:
- Always connects initiatives to human impact (lives improved, jobs created, girls in school)
- Uses data to support every major point
- Emphasizes partnership: "we" not "I", collective action
- Focuses on "what we WILL DO" not "what we plan to do"
- Direct language: "Let me be direct", "The facts are stark", "The challenge before us"
- Creates urgency while maintaining optimism
"""
    })
    
    # SECTION 2: ALL SPEECHES FROM DATABASE
    print("📝 Generating Section 2: Speeches Database...")
    speeches = db_data.get('speeches', [])
    
    speeches_content = f"\n=== RJ BANGA SPEECHES FROM DATABASE ({len(speeches)} speeches) ===\n\n"
    speeches_content += "This section contains the complete text of all RJ Banga's speeches as World Bank President.\n"
    speeches_content += "Use this to understand his authentic voice, priorities, and communication style.\n\n"
    
    for speech in speeches[:50]:  # Limit to 50 most recent
        speeches_content += f"\n{'='*80}\n"
        speeches_content += f"SPEECH: {speech.get('title', 'Untitled')}\n"
        speeches_content += f"Date: {speech.get('date', 'Unknown date')}\n"
        speeches_content += f"Location: {speech.get('location', 'N/A')}\n"
        speeches_content += f"{'='*80}\n\n"
        speeches_content += speech.get('full_text', speech.get('content', '')) + "\n\n"
    
    sections.append({
        'title': 'RJ BANGA SPEECHES COLLECTION',
        'content': speeches_content
    })
    
    # SECTION 3: WORLD BANK STRATEGIC DOCUMENTS
    print("📄 Generating Section 3: Strategic Documents...")
    documents = db_data.get('documents', [])
    
    docs_content = f"\n=== WORLD BANK STRATEGIC DOCUMENTS ({len(documents)} documents) ===\n\n"
    docs_content += "Official World Bank strategy documents, reports, and policy papers.\n\n"
    
    for doc in documents[:50]:
        docs_content += f"\n--- DOCUMENT: {doc.get('title', 'Untitled')} ---\n"
        docs_content += f"Type: {doc.get('doc_type', 'N/A')}\n"
        docs_content += f"Date: {doc.get('date', 'N/A')}\n"
        docs_content += f"URL: {doc.get('url', 'N/A')}\n"
        if doc.get('summary'):
            docs_content += f"Summary: {doc['summary']}\n"
        if doc.get('content'):
            docs_content += f"Content:\n{doc['content'][:1000]}...\n"
        docs_content += "\n"
    
    sections.append({
        'title': 'WORLD BANK STRATEGIC DOCUMENTS',
        'content': docs_content
    })
    
    # SECTION 4: WORLD BANK PROJECTS
    print("🏗️ Generating Section 4: Projects...")
    projects = db_data.get('projects', [])
    
    projects_content = f"\n=== WORLD BANK PROJECTS ({len(projects)} recent projects) ===\n\n"
    projects_content += "Actual World Bank projects that demonstrate our work on the ground.\n\n"
    
    for project in projects[:30]:
        projects_content += f"\n--- PROJECT: {project.get('project_name', 'Untitled')} ---\n"
        projects_content += f"Country: {project.get('country', 'N/A')}\n"
        projects_content += f"Status: {project.get('status', 'N/A')}\n"
        projects_content += f"Sector: {project.get('sector', 'N/A')}\n"
        projects_content += f"Approval Date: {project.get('approval_date', 'N/A')}\n"
        if project.get('total_commitment'):
            projects_content += f"Commitment: ${project['total_commitment']:,.0f}\n"
        if project.get('description'):
            projects_content += f"Description: {project['description'][:500]}...\n"
        projects_content += "\n"
    
    sections.append({
        'title': 'WORLD BANK PROJECTS DATABASE',
        'content': projects_content
    })
    
    # SECTION 5: COUNTRIES & DATA
    print("🌍 Generating Section 5: Countries...")
    countries = db_data.get('countries', [])
    
    countries_content = f"\n=== COUNTRIES DATABASE ({len(countries)} countries) ===\n\n"
    countries_content += "World Bank country data and partnerships.\n\n"
    
    for country in countries[:30]:
        countries_content += f"\n--- {country.get('name', 'Unknown').upper()} ---\n"
        if country.get('region'):
            countries_content += f"Region: {country['region']}\n"
        if country.get('income_level'):
            countries_content += f"Income Level: {country['income_level']}\n"
        if country.get('population'):
            countries_content += f"Population: {country['population']:,}\n"
        if country.get('gdp'):
            countries_content += f"GDP: ${country['gdp']:,.0f}\n"
        if country.get('wb_engagement'):
            countries_content += f"WB Engagement: {country['wb_engagement'][:300]}...\n"
        countries_content += "\n"
    
    sections.append({
        'title': 'COUNTRIES DATABASE',
        'content': countries_content
    })
    
    # SECTION 6: LEADERSHIP TEAM
    print("👥 Generating Section 6: Leadership...")
    leadership = db_data.get('leadership', [])
    
    leadership_content = f"\n=== WORLD BANK LEADERSHIP TEAM ({len(leadership)} members) ===\n\n"
    
    for person in leadership:
        leadership_content += f"\n{person.get('name', 'Unknown')}\n"
        leadership_content += f"Title: {person.get('title', 'N/A')}\n"
        if person.get('department'):
            leadership_content += f"Department: {person['department']}\n"
        if person.get('bio'):
            leadership_content += f"Bio: {person['bio'][:300]}...\n"
        leadership_content += "\n"
    
    sections.append({
        'title': 'WORLD BANK LEADERSHIP TEAM',
        'content': leadership_content
    })
    
    # SECTION 7: STRATEGIC PRIORITIES
    print("🎯 Generating Section 7: Priorities...")
    priorities = db_data.get('priorities', [])
    
    priorities_content = f"\n=== STRATEGIC PRIORITIES ({len(priorities)} priorities) ===\n\n"
    
    for priority in priorities:
        priorities_content += f"\n{priority.get('title', 'Untitled').upper()}\n"
        if priority.get('description'):
            priorities_content += f"{priority['description']}\n"
        if priority.get('targets'):
            priorities_content += f"Targets: {priority['targets']}\n"
        if priority.get('status'):
            priorities_content += f"Status: {priority['status']}\n"
        priorities_content += "\n"
    
    sections.append({
        'title': 'STRATEGIC PRIORITIES',
        'content': priorities_content
    })
    
    # SECTION 8: DEPARTMENTS
    print("🏢 Generating Section 8: Departments...")
    departments = db_data.get('departments', [])
    
    departments_content = f"\n=== WORLD BANK DEPARTMENTS ({len(departments)} departments) ===\n\n"
    
    for dept in departments:
        departments_content += f"\n{dept.get('name', 'Unknown')}\n"
        if dept.get('description'):
            departments_content += f"{dept['description'][:300]}...\n"
        if dept.get('head'):
            departments_content += f"Head: {dept['head']}\n"
        departments_content += "\n"
    
    sections.append({
        'title': 'WORLD BANK DEPARTMENTS',
        'content': departments_content
    })
    
    return sections

def create_knowledge_files(sections, output_dir='elevenlabs-knowledge'):
    """Create final knowledge base files"""
    output_path = Path(output_dir)
    output_path.mkdir(exist_ok=True)
    
    # Generate timestamp
    timestamp = datetime.now().isoformat()
    
    # Create main knowledge base text file
    print('\n📄 Generating main knowledge base document...')
    
    main_doc = f"""# AJAY BANGA (RJ BANGA) / WORLD BANK GROUP - COMPREHENSIVE KNOWLEDGE BASE
Generated: {timestamp}
Source: Supabase Database + Local Files

=============================================================================
ABOUT THIS KNOWLEDGE BASE
=============================================================================

This knowledge base contains EVERYTHING about Ajay Banga's leadership, speaking style,
World Bank projects, strategic documents, country data, and global development initiatives.

USE THIS INFORMATION TO:
- Respond as Ajay Banga would - with his characteristic style
- Provide data-driven, specific answers about World Bank work
- Discuss countries, projects, and strategic priorities with authority
- Use his authentic voice, vocabulary, and communication patterns
- Focus on measurable impact, partnerships, and human outcomes

=============================================================================
"""
    
    for section in sections:
        main_doc += f"\n\n{'='*80}\n"
        main_doc += f"{section['title']}\n"
        main_doc += f"{'='*80}\n"
        main_doc += section['content']
    
    # Save main text file (for ElevenLabs)
    txt_path = output_path / 'knowledge_base_full.txt'
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(main_doc)
    
    # Save as JSON
    knowledge_json = {
        'version': '2.0',
        'generated_at': timestamp,
        'source': 'Supabase Database + Local Files',
        'sections': sections
    }
    
    json_path = output_path / 'knowledge_base_full.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(knowledge_json, f, indent=2, ensure_ascii=False)
    
    # Create split files (for token limits)
    print('\n📑 Creating split knowledge files...')
    
    # File 1: Profile + Speeches (core content)
    core_sections = [s for s in sections if 'PROFILE' in s['title'] or 'SPEECHES' in s['title']]
    core_doc = f"""# RJ BANGA KNOWLEDGE BASE - PART 1: PROFILE & SPEECHES
Generated: {timestamp}

"""
    for section in core_sections:
        core_doc += f"\n\n{'='*80}\n{section['title']}\n{'='*80}\n{section['content']}"
    
    with open(output_path / 'knowledge_part1_profile_speeches.txt', 'w', encoding='utf-8') as f:
        f.write(core_doc)
    
    # File 2: Documents + Projects
    data_sections = [s for s in sections if 'DOCUMENTS' in s['title'] or 'PROJECTS' in s['title']]
    data_doc = f"""# RJ BANGA KNOWLEDGE BASE - PART 2: DOCUMENTS & PROJECTS
Generated: {timestamp}

"""
    for section in data_sections:
        data_doc += f"\n\n{'='*80}\n{section['title']}\n{'='*80}\n{section['content']}"
    
    with open(output_path / 'knowledge_part2_documents_projects.txt', 'w', encoding='utf-8') as f:
        f.write(data_doc)
    
    # File 3: Countries + Leadership + Departments
    org_sections = [s for s in sections if any(x in s['title'] for x in ['COUNTRIES', 'LEADERSHIP', 'DEPARTMENTS', 'PRIORITIES'])]
    org_doc = f"""# RJ BANGA KNOWLEDGE BASE - PART 3: ORGANIZATION & DATA
Generated: {timestamp}

"""
    for section in org_sections:
        org_doc += f"\n\n{'='*80}\n{section['title']}\n{'='*80}\n{section['content']}"
    
    with open(output_path / 'knowledge_part3_organization.txt', 'w', encoding='utf-8') as f:
        f.write(org_doc)
    
    # Create summary file
    summary = {
        'generated_at': timestamp,
        'total_sections': len(sections),
        'files_created': [
            'knowledge_base_full.txt',
            'knowledge_base_full.json',
            'knowledge_part1_profile_speeches.txt',
            'knowledge_part2_documents_projects.txt',
            'knowledge_part3_organization.txt'
        ],
        'sections': [{'title': s['title'], 'size': len(s['content'])} for s in sections],
        'total_size_kb': len(main_doc.encode('utf-8')) / 1024,
        'total_characters': len(main_doc)
    }
    
    with open(output_path / 'knowledge_summary.json', 'w', encoding='utf-8') as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)
    
    return summary

def main():
    print("🚀 Starting COMPREHENSIVE ElevenLabs Knowledge Base Export...")
    print("="*80)
    print()
    
    # Connect to database
    print("🔌 Connecting to Supabase database...")
    supabase = get_supabase_client()
    print("   ✅ Connected to Supabase\n")
    
    # Fetch all data from database
    db_data = {
        'speeches': fetch_speeches(supabase),
        'documents': fetch_documents(supabase),
        'projects': fetch_projects(supabase),
        'countries': fetch_countries(supabase),
        'leadership': fetch_leadership(supabase),
        'priorities': fetch_priorities(supabase),
        'departments': fetch_departments(supabase)
    }
    
    print()
    
    # Load local files
    local_data = load_local_files()
    
    # Generate knowledge sections
    print()
    sections = generate_knowledge_sections(db_data, local_data)
    
    # Create knowledge files
    summary = create_knowledge_files(sections)
    
    # Print summary
    print('\n✅ EXPORT COMPLETE!')
    print('='*80)
    print(f'\n📊 SUMMARY:')
    print(f'  - Total sections: {summary["total_sections"]}')
    print(f'  - Total size: {summary["total_size_kb"]:.1f} KB')
    print(f'  - Total characters: {summary["total_characters"]:,}')
    print(f'  - Files created: {len(summary["files_created"])}')
    print(f'\n📁 Location: elevenlabs-knowledge/')
    for file in summary['files_created']:
        print(f'  - {file}')
    
    print('\n📋 NEXT STEPS FOR ELEVENLABS:')
    print('━' * 80)
    print('1. Go to: https://elevenlabs.io/app/conversational-ai')
    print('2. Select your agent')
    print('3. Upload knowledge files from elevenlabs-knowledge/ directory')
    print('   - For best results, upload all 3 parts separately')
    print('   - Or use knowledge_base_full.txt if size allows')
    print('4. Test your agent with questions about World Bank, countries, projects')
    print('━' * 80)
    
    return summary

if __name__ == '__main__':
    try:
        summary = main()
        print('\n✨ Done!')
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        exit(1)

