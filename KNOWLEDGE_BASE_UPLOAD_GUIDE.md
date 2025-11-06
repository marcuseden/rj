# 📚 Updated ElevenLabs Knowledge Base - Upload Guide

## ✅ New Knowledge Base Generated Successfully!

Your comprehensive knowledge base has been updated with content from your **full Supabase database**.

### 📊 What's New in This Version

**Generated from FULL DATABASE:**
- ✅ **13 RJ Banga Speeches** from database
- ✅ **53 World Bank Strategic Documents** from database
- ✅ **50 Countries** with full data from database
- ✅ **Style Guide** analysis (vocabulary & phrases)
- ✅ **6 Strategic Priorities** (verified from speeches)
- ✅ **Local backup files** as additional context

**Total Size:** 76 KB (split into 3 manageable parts)

---

## 📁 Files Available

```
elevenlabs-knowledge/
├── knowledge_base_full.txt          ← Complete version (76 KB) - use if ElevenLabs allows
├── knowledge_base_full.json         ← JSON format for programmatic use
├── knowledge_part1_profile_speeches.txt    ← Part 1: Profile & Speeches (24 KB)
├── knowledge_part2_documents_projects.txt  ← Part 2: Documents (48 KB)
├── knowledge_part3_organization.txt        ← Part 3: Countries & Org (4 KB)
└── knowledge_summary.json           ← Metadata about the knowledge base
```

**Also available (legacy files):**
- `knowledge_base.txt` - Previous version (183 KB)
- `knowledge_base_condensed.json` - Condensed version

---

## 🎯 RECOMMENDED: Upload Strategy

### Option A: Upload All Parts (Best Results)

Upload all 3 parts separately to your ElevenLabs agent:

1. **Part 1 - Profile & Speeches** (`knowledge_part1_profile_speeches.txt`)
   - Contains RJ's speaking style, patterns, vocabulary
   - All 13 speeches from database
   - Critical for authentic voice

2. **Part 2 - Documents & Projects** (`knowledge_part2_documents_projects.txt`)
   - 53 strategic documents
   - World Bank policy papers
   - Strategic initiatives

3. **Part 3 - Organization** (`knowledge_part3_organization.txt`)
   - Country data (50 countries)
   - Organizational context

### Option B: Upload Full Version (If Size Allows)

If ElevenLabs supports larger files:
- Upload `knowledge_base_full.txt` (76 KB) as a single file

---

## 🚀 Step-by-Step Upload Instructions

### Step 1: Access ElevenLabs Dashboard

1. Go to: https://elevenlabs.io/app/conversational-ai
2. Log in with your account
3. Find your agent: **`agent_2101k94jg1rpfef8hrt86n3qrm5q`**

### Step 2: Upload Knowledge Base Files

#### Method 1: File Upload (Recommended)

1. Click on your agent
2. Navigate to "Knowledge Base" section
3. Click "Upload Files" or "Add Documents"
4. Upload files in this order:
   - `knowledge_part1_profile_speeches.txt`
   - `knowledge_part2_documents_projects.txt`
   - `knowledge_part3_organization.txt`
5. Wait for processing
6. Click "Save"

#### Method 2: Text Paste (If Upload Fails)

1. Open each `.txt` file in a text editor
2. Copy the entire contents
3. In ElevenLabs, find "System Prompt" or "Instructions"
4. Paste the content with this header:

```
KNOWLEDGE BASE - [PART NAME]
Use this verified information to respond as RJ Banga would.

[Paste file contents here]
```

### Step 3: Update System Prompt

Add or update your agent's system prompt with:

```
You are Ajay Banga (RJ Banga), the 14th President of the World Bank Group.

COMMUNICATION STYLE:
- Direct, action-oriented language with specific data and measurable targets
- Focus on collaboration: governments, private sector, and development banks working together
- Data-driven: Support every claim with specific numbers and concrete examples
- Human impact focus: Always connect to jobs created, lives improved, girls in school
- Use signature phrases: "forecasts are not destiny", "journeys are fueled by hope, they are realized by deeds"
- Professional but accessible tone
- Emphasize speed, urgency, and accountability

KEY STRATEGIC PRIORITIES (always reference these):
1. Job Creation - 1.2 billion young people need jobs by 2035 (800M job gap)
2. Mission 300 - Electricity for 300 million Africans by 2030
3. Climate Finance - 45% of funding ($40B+ annually) toward climate
4. Healthcare - Quality care for 1.5 billion people by 2030
5. Private Capital Mobilization - $150B+ in commitments secured
6. IDA Replenishment - Record $100B+ for poorest countries
7. Better Bank - Cutting approval times by one-third

RESPONSE GUIDELINES:
- Draw from the comprehensive knowledge base (13 speeches, 53 documents, 50 countries)
- Use specific numbers, concrete examples, and real project references
- Emphasize partnership and collective action
- Focus on measurable outcomes and accountability
- Connect every initiative to job creation or human outcomes
- Stay optimistic but realistic about challenges
- Use action language: "We WILL" not "We hope" or "We plan"

When answering questions:
- Reference specific speeches, documents, or projects from the knowledge base
- Cite real data points and targets
- Use concrete examples (e.g., "mini-grids in Nigeria cut farmers' work time in half")
- Always emphasize multiple stakeholder partnerships
- End with call to action or next steps
```

---

## 🧪 Testing Your Updated Agent

After uploading, test with these questions to verify the knowledge base is working:

### Test Questions:

1. **"What is Mission 300 and why does it matter?"**
   - Should cite: 300 million Africans, electricity by 2030, 90M connections first phase

2. **"What are your top priorities as World Bank President?"**
   - Should list all 7 priorities with specific targets and numbers

3. **"Tell me about job creation challenges in developing countries"**
   - Should cite: 1.2 billion young people, 420M jobs projected, 800M gap

4. **"What is the Better Bank initiative?"**
   - Should mention: Cutting approval times by 1/3, scorecard from 153 to 22 metrics

5. **"How does the World Bank mobilize private capital?"**
   - Should cite: $150B+ commitments, guarantees, de-risking instruments

6. **"What's your approach to climate finance?"**
   - Should cite: 45% of funding, $40B+ annually, CCDRs for every country

7. **"Tell me about IDA replenishment"**
   - Should cite: Record $100B+, IDA21: $93B, pay-for-performance

8. **"What World Bank projects are you working on in Africa?"**
   - Should reference specific projects from database with countries and sectors

### Expected Characteristics:
- ✅ Specific numbers and data points
- ✅ Real project examples with countries
- ✅ Partnership emphasis
- ✅ Action-oriented language
- ✅ Connection to job creation/human outcomes
- ✅ Urgency but optimistic tone

---

## 🔄 Database-Backed Writing Analysis Tool

**BONUS:** The writing alignment tool has also been updated!

### What's New:
- Now pulls from **full Supabase database** in real-time
- Uses 13 speeches, 53 documents, 50 countries for analysis
- Provides database-backed suggestions
- References specific speeches/documents in feedback

### Location:
`/rj-writing-assistant` page in your app

### How it works:
1. Fetches latest content from Supabase database
2. Builds comprehensive RJ Banga context
3. Analyzes user text against REAL database content
4. Provides specific, database-backed improvements
5. Cites actual speeches, documents, and priorities

---

## 📊 Knowledge Base Statistics

```json
{
  "version": "2.0",
  "source": "Supabase Database + Local Files",
  "generated": "2025-11-06",
  "content": {
    "speeches": 13,
    "documents": 53,
    "countries": 50,
    "priorities": 6,
    "total_size_kb": 76.3,
    "total_characters": 77954,
    "files": 5
  },
  "database_tables_used": [
    "speeches",
    "worldbank_documents",
    "worldbank_countries"
  ]
}
```

---

## 🔧 Troubleshooting

### Issue: "File too large"
- **Solution**: Use the 3-part split files instead of full version
- Part 1: 24 KB, Part 2: 48 KB, Part 3: 4 KB

### Issue: "Knowledge not being used"
1. Check if knowledge base is enabled in agent settings
2. Verify system prompt references the knowledge base
3. Add explicit instruction: "Use knowledge base content to answer"
4. Lower temperature (0.7-0.8) for more consistent style

### Issue: Agent not sounding like RJ Banga
1. Strengthen system prompt with more style guidelines
2. Add more example phrases from speeches
3. Emphasize data-driven, action-oriented language
4. Test with specific questions about priorities

### Issue: Agent gives vague answers
1. Ensure all knowledge files are uploaded and processed
2. Check that agent has access to knowledge base
3. Add prompt: "Always cite specific numbers and concrete examples"

---

## 🔄 Updating Knowledge Base

To regenerate with latest database content:

```bash
cd "/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches"
source venv/bin/activate
python3 export_full_knowledge_base.py
```

Then re-upload the new files to ElevenLabs.

---

## 📋 What Makes This Knowledge Base Special

### Database-Driven Content
- **Real-time accuracy**: Pulled directly from Supabase
- **Comprehensive coverage**: Speeches, documents, countries, projects
- **Verified data**: All numbers and facts from official sources

### Authentic Voice Patterns
- 13 complete speeches analyzed
- Vocabulary patterns extracted
- Common phrases identified
- Style guide based on real content

### Actionable Context
- Specific strategic priorities with targets
- Real project examples with countries
- Concrete data points and numbers
- Measurable outcomes and timelines

### Easy Updates
- Simple Python script to regenerate
- Pulls latest from database automatically
- Split files for size management
- JSON format for programmatic access

---

## 🎉 You're Ready!

Your ElevenLabs agent now has access to:
- ✅ Complete RJ Banga speaking style (from 13 real speeches)
- ✅ 53 World Bank strategic documents
- ✅ 50 countries with full data
- ✅ 6 strategic priorities with verified targets
- ✅ Real project examples and concrete outcomes
- ✅ Signature phrases and vocabulary patterns

The agent should now respond **authentically** as RJ Banga with:
- Specific data points and numbers
- Real World Bank project examples
- Strategic priorities with measurable targets
- Partnership and collaboration emphasis
- Action-oriented, urgent but optimistic tone
- Connection to job creation and human impact

---

## 📞 Support

**Files Location:**
```
/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches/elevenlabs-knowledge/
```

**Export Script:**
```
/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches/export_full_knowledge_base.py
```

**Writing Analysis Tool:**
```
/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches/app/api/rj-writing-analysis/route.ts
```

---

## 🚀 Next Steps

1. ✅ Knowledge base files generated
2. ⏳ Upload to ElevenLabs (3 parts or full file)
3. ⏳ Update system prompt
4. ⏳ Test with verification questions
5. ⏳ Use writing analysis tool for content creation

**Good luck!** 🎉

