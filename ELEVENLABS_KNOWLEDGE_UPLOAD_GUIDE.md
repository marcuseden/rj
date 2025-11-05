# 📚 How to Add Knowledge Base to Your ElevenLabs Agent

## ✅ Knowledge Base Created Successfully!

Your comprehensive knowledge base has been exported and is ready to use:

```
elevenlabs-knowledge/
  ├── knowledge_base.txt          ← Main file (183 KB)
  ├── knowledge_base.json          ← Structured data
  └── knowledge_base_condensed.json ← Smaller version
```

## 📊 What's Included

✅ **14 Ajay Banga Speeches** (13,240 words)  
✅ **4 World Bank Strategy Documents**  
✅ **14 Additional Speech Transcripts**  
✅ **Ajay Banga Speaking Style Guide**  
✅ **Total: 183 KB of knowledge**

---

## 🎯 METHOD 1: Upload to ElevenLabs Dashboard (Recommended)

### Step 1: Open ElevenLabs Dashboard
1. Go to: https://elevenlabs.io/app/conversational-ai
2. Log in with your account

### Step 2: Select Your Agent
1. Find agent: **`agent_2101k94jg1rpfef8hrt86n3qrm5q`**
2. Click to open agent settings

### Step 3: Add Knowledge Base

**Option A: Upload File**
1. Click on "Knowledge Base" tab
2. Click "Upload Files" or "Add Document"
3. Select: `elevenlabs-knowledge/knowledge_base.txt`
4. Wait for processing
5. Click "Save"

**Option B: Paste Text (if file upload doesn't work)**
1. Open `elevenlabs-knowledge/knowledge_base.txt` in a text editor
2. Copy all contents
3. In ElevenLabs dashboard, find "System Prompt" or "Instructions" section
4. Paste the knowledge base text
5. Add before the text:
   ```
   KNOWLEDGE BASE:
   Use the following comprehensive information to respond as Ajay Banga would.
   
   [Paste knowledge base here]
   ```
6. Click "Save"

### Step 4: Update System Prompt
Add this to your agent's system prompt:

```
You are Ajay Banga, the 14th President of the World Bank Group.

SPEAKING STYLE:
- Direct, action-oriented language with specific data and facts
- Focus on collaboration between governments, private sector, and development banks
- Use signature phrases like "forecasts are not destiny" and "journeys are fueled by hope, they are realized by deeds"
- Professional but accessible tone
- Always emphasize measurable results and impact

KEY PRIORITIES:
1. Job creation (1.2 billion young people need jobs by 2035)
2. Energy access (Mission 300 - electricity for 300M Africans by 2030)
3. Climate resilience (45% of funding toward climate)
4. Healthcare access (1.5 billion people by 2030)
5. Private sector mobilization
6. IDA replenishment ($100B+ for poorest countries)

When answering questions:
- Draw from the extensive speech and document knowledge base provided
- Use specific numbers and concrete examples
- Focus on partnership and collective action
- Highlight measurable outcomes and accountability
- Stay optimistic but realistic about challenges
```

---

## 🎯 METHOD 2: API Integration (Advanced)

If your agent uses the ElevenLabs API, you can pass context dynamically:

```javascript
const response = await fetch('https://api.elevenlabs.io/v1/convai/conversation', {
  method: 'POST',
  headers: {
    'xi-api-key': 'YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    agent_id: 'agent_2101k94jg1rpfef8hrt86n3qrm5q',
    context: {
      // Add relevant sections from knowledge_base.json
      speeches: knowledgeBase.sections.find(s => s.title === 'AJAY BANGA SPEECHES COLLECTION'),
      style: knowledgeBase.sections.find(s => s.title === 'SPEAKING STYLE & CHARACTERISTICS')
    }
  })
});
```

---

## 🎯 METHOD 3: Create Knowledge Base Collection (If Available)

Some ElevenLabs plans support knowledge base collections:

1. Go to "Knowledge" section in ElevenLabs
2. Click "Create New Collection"
3. Name it: "Ajay Banga World Bank Knowledge"
4. Upload all files from `elevenlabs-knowledge/`
5. Link collection to your agent
6. Save

---

## 📝 Testing Your Agent

After uploading the knowledge base, test with these questions:

### Test Questions:

1. **"What is Mission 300?"**
   - Should mention: 300 million Africans, electricity access by 2030

2. **"What are your priorities as World Bank President?"**
   - Should mention: Jobs, energy, climate, healthcare, private sector, IDA

3. **"What's your view on development and jobs?"**
   - Should cite: 1.2 billion young people, 420 million jobs projected, 800M gap

4. **"Tell me about IDA replenishment"**
   - Should mention: Record $100B secured, largest ever, pay-for-performance

5. **"What is the Better Bank initiative?"**
   - Should mention: Cutting approval times by 1/3, scorecard from 153 to 22 metrics

### Expected Speaking Style:
- ✅ Data-driven (specific numbers)
- ✅ Direct and action-oriented
- ✅ Focus on partnerships
- ✅ Use signature phrases
- ✅ Professional but accessible

---

## 🔧 Troubleshooting

### "File too large" Error
- Use `knowledge_base_condensed.json` instead (smaller)
- Or split into sections manually

### "Knowledge not being used" Issue
1. Make sure knowledge base is enabled in agent settings
2. Check if system prompt references the knowledge base
3. Try adding "use knowledge base" instruction explicitly

### Agent not sounding like Ajay Banga
1. Strengthen the system prompt with more specific style guidelines
2. Add more example phrases from the speeches
3. Set temperature lower (0.7-0.8) for more consistent style

---

## 📊 Knowledge Base Statistics

```
Total Characters: 185,843
Total Size: 183 KB
Sections: 3
- Speeches: 14 complete speeches
- Documents: 4 World Bank strategy docs  
- Transcripts: 14 additional speech files
```

---

## 🔄 Updating the Knowledge Base

To regenerate the knowledge base with latest data:

```bash
cd "/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches"
python3 export_elevenlabs_knowledge.py
```

Then re-upload to ElevenLabs.

---

## 🎉 You're Ready!

Your ElevenLabs agent now has access to:
- ✅ All 14 Ajay Banga speeches
- ✅ World Bank strategy documents
- ✅ Speaking style patterns
- ✅ Key priorities and initiatives
- ✅ Signature phrases and vocabulary

The agent should now respond authentically as Ajay Banga with deep knowledge of:
- World Bank operations
- Development priorities
- Global economic challenges
- Mission 300 and key initiatives
- IDA replenishment efforts
- Better Bank reforms

---

## 📞 Need Help?

If ElevenLabs interface has changed or you need specific guidance:
1. Check ElevenLabs documentation: https://elevenlabs.io/docs
2. Look for "Knowledge Base", "Context", or "System Prompt" sections
3. Contact ElevenLabs support if upload features are unclear

**Files Location:**
`/Users/marlow/Documents/Cursor-projects/RJ Banga Speaches/elevenlabs-knowledge/`

Good luck! 🚀

