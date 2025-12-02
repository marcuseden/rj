#!/usr/bin/env python3
"""
Export comprehensive knowledge base from database for ElevenLabs Agent
Combines speeches, projects, and World Bank data into a formatted knowledge base
"""

import json
import os
from datetime import datetime
from pathlib import Path

def load_local_data():
    """Load data from local JSON files"""
    print("📝 Loading local data files...")
    
    knowledge = {
        'version': '1.0',
        'generated_at': datetime.now().isoformat(),
        'source': 'World Bank Database + Ajay Banga Speeches',
        'sections': []
    }
    
    # 1. AJAY BANGA PROFILE & STYLE
    print("📝 Section 1: Ajay Banga Profile & Speaking Style")
    try:
        with open('public/banga_style_guide.json', 'r', encoding='utf-8') as f:
            style_guide = json.load(f)
        
        vocabulary_str = '\n'.join([f"- {word}" for word in (style_guide.get('vocabulary', [])[:50])])
        phrases_3word = style_guide.get('common_phrases', {}).get('3_word', [])[:20]
        phrases_str = '\n'.join([f"- \"{p['phrase']}\" (used {p['count']} times)" for p in phrases_3word])
        
        knowledge['sections'].append({
            'title': 'AJAY BANGA - SPEAKING STYLE & CHARACTERISTICS',
            'content': f"""
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

COMMON VOCABULARY:
{vocabulary_str}

TOP 3-WORD PHRASES:
{phrases_str}
"""
        })
        print("   ✅ Loaded style guide")
    except Exception as e:
        print(f"   ⚠️  Could not load style guide: {e}")
    
    # 2. SPEECHES DATABASE
    print("📝 Section 2: Ajay Banga Speeches")
    try:
        with open('public/speeches_database.json', 'r', encoding='utf-8') as f:
            speeches_db = json.load(f)
        
        total_speeches = speeches_db.get('total_speeches', 0)
        total_words = speeches_db.get('total_words', 0)
        speeches = speeches_db.get('speeches', [])
        
        speeches_content = f"\n=== AJAY BANGA SPEECHES ({total_speeches} speeches, {total_words:,} words) ===\n\n"
        
        for speech in speeches:
            speeches_content += f"\n--- SPEECH {speech['id']}: {speech.get('title', 'Untitled')} ---\n"
            speeches_content += f"{speech.get('full_text', speech.get('text', ''))}\n\n"
        
        knowledge['sections'].append({
            'title': 'AJAY BANGA SPEECHES COLLECTION',
            'content': speeches_content
        })
        print(f"   ✅ Loaded {total_speeches} speeches ({total_words:,} words)")
    except Exception as e:
        print(f"   ⚠️  Could not load speeches: {e}")
    
    # 3. WORLD BANK STRATEGY DOCUMENTS (from ajay-banga-voice-clone)
    print("📝 Section 3: World Bank Strategy Documents")
    try:
        wb_docs_path = 'ajay-banga-voice-clone/public/data/worldbank-strategy/documents.json'
        if os.path.exists(wb_docs_path):
            with open(wb_docs_path, 'r', encoding='utf-8') as f:
                wb_docs = json.load(f)
            
            docs_content = f"\n=== WORLD BANK STRATEGY DOCUMENTS ({len(wb_docs)} documents) ===\n\n"
            
            for doc in wb_docs[:50]:  # First 50 documents
                docs_content += f"\nDOCUMENT: {doc.get('title', 'Untitled')}\n"
                docs_content += f"URL: {doc.get('url', 'N/A')}\n"
                docs_content += f"Date: {doc.get('date', 'N/A')}\n"
                if 'summary' in doc:
                    docs_content += f"Summary: {doc['summary']}\n"
                if 'content' in doc and doc['content']:
                    docs_content += f"Content: {doc['content'][:500]}...\n"
                docs_content += "---\n"
            
            knowledge['sections'].append({
                'title': 'WORLD BANK STRATEGY DOCUMENTS',
                'content': docs_content
            })
            print(f"   ✅ Loaded {len(wb_docs)} World Bank documents")
    except Exception as e:
        print(f"   ⚠️  Could not load WB strategy docs: {e}")
    
    # 4. CLEANED SPEECHES (additional context)
    print("📝 Section 4: Additional Speech Texts")
    try:
        cleaned_speeches_dir = Path('cleaned_speeches')
        if cleaned_speeches_dir.exists():
            speech_files = list(cleaned_speeches_dir.glob('*.txt'))
            
            additional_content = f"\n=== ADDITIONAL SPEECH TEXTS ({len(speech_files)} files) ===\n\n"
            
            for speech_file in sorted(speech_files)[:10]:  # First 10
                try:
                    with open(speech_file, 'r', encoding='utf-8') as f:
                        content = f.read()
                    additional_content += f"\n--- {speech_file.name} ---\n{content}\n\n"
                except:
                    pass
            
            knowledge['sections'].append({
                'title': 'ADDITIONAL SPEECH TRANSCRIPTS',
                'content': additional_content
            })
            print(f"   ✅ Loaded {len(speech_files)} additional speech files")
    except Exception as e:
        print(f"   ⚠️  Could not load additional speeches: {e}")
    
    return knowledge

def generate_knowledge_base():
    """Generate the knowledge base files"""
    print("🚀 Starting ElevenLabs Knowledge Base Export...\n")
    
    knowledge = load_local_data()
    
    # Generate the final knowledge base document
    print('\n📄 Generating knowledge base document...')
    
    final_document = f"""# AJAY BANGA / WORLD BANK GROUP - COMPREHENSIVE KNOWLEDGE BASE
Generated: {knowledge['generated_at']}
Source: {knowledge['source']}

This knowledge base contains everything about Ajay Banga's leadership, speaking style, 
World Bank projects, strategic documents, and global economic data.

Use this information to respond as Ajay Banga would - with his characteristic style,
data-driven approach, and focus on measurable development impact.

"""
    
    for section in knowledge['sections']:
        final_document += f"\n\n{'=' * 80}\n"
        final_document += f"{section['title']}\n"
        final_document += f"{'=' * 80}\n"
        final_document += section['content']
    
    # Save outputs
    output_dir = Path('elevenlabs-knowledge')
    output_dir.mkdir(exist_ok=True)
    
    # Save as text file (primary format for ElevenLabs)
    txt_path = output_dir / 'knowledge_base.txt'
    with open(txt_path, 'w', encoding='utf-8') as f:
        f.write(final_document)
    
    # Save as JSON (for programmatic access)
    json_path = output_dir / 'knowledge_base.json'
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(knowledge, f, indent=2, ensure_ascii=False)
    
    # Create a condensed version (for token limits)
    condensed = {
        **knowledge,
        'sections': [{
            **s,
            'content': s['content'][:5000] + ('\n...(truncated for size)' if len(s['content']) > 5000 else '')
        } for s in knowledge['sections']]
    }
    
    condensed_path = output_dir / 'knowledge_base_condensed.json'
    with open(condensed_path, 'w', encoding='utf-8') as f:
        json.dump(condensed, f, indent=2, ensure_ascii=False)
    
    file_size_kb = len(final_document.encode('utf-8')) / 1024
    
    print('\n✅ Export Complete!')
    print(f'\nFiles created in: {output_dir}/')
    print('  - knowledge_base.txt (main file for ElevenLabs)')
    print('  - knowledge_base.json (full structured data)')
    print('  - knowledge_base_condensed.json (shorter version)')
    
    print('\n📊 SUMMARY:')
    print(f'  - Sections: {len(knowledge["sections"])}')
    print(f'  - Total size: {file_size_kb:.1f} KB')
    print(f'  - Characters: {len(final_document):,}')
    
    print('\n📋 NEXT STEPS FOR ELEVENLABS:')
    print('━' * 70)
    print('1. Go to: https://elevenlabs.io/app/conversational-ai')
    print('2. Select your agent: agent_2101k94jg1rpfef8hrt86n3qrm5q')
    print('3. Click "Knowledge Base" or "System Prompt" section')
    print('4. Upload or paste from: elevenlabs-knowledge/knowledge_base.txt')
    print('5. Save and test your agent!')
    print('━' * 70)
    
    # Check if file is too large for ElevenLabs
    if file_size_kb > 500:
        print(f'\n⚠️  WARNING: File is {file_size_kb:.1f} KB')
        print('   ElevenLabs knowledge base may have size limits (typically 100-500 KB)')
        print('   Consider using knowledge_base_condensed.json or splitting into sections')
    
    return knowledge

if __name__ == '__main__':
    try:
        generate_knowledge_base()
        print('\n✨ Done!')
    except Exception as e:
        print(f'\n❌ Error: {e}')
        import traceback
        traceback.print_exc()
        exit(1)







