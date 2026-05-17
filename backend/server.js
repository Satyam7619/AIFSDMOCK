require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const Candidate = require('./models/Candidate');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// 0. Root Route
app.get('/', (req, res) => {
  res.send('Candidate Shortlisting API is running!');
});

// 1. Add Candidate
app.post('/api/candidates', async (req, res) => {
  try {
    const { name, email, skills, experience, bio } = req.body;
    const candidate = new Candidate({ name, email, skills, experience, bio });
    await candidate.save();
    res.status(201).json({ message: 'Candidate added successfully', candidate });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add candidate', details: error.message });
  }
});

// 2. Get All Candidates
app.get('/api/candidates', async (req, res) => {
  try {
    const candidates = await Candidate.find().sort({ createdAt: -1 });
    res.status(200).json(candidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch candidates', details: error.message });
  }
});

// 3. Shortlist Candidates (Basic Logic)
app.post('/api/match', async (req, res) => {
  try {
    const { requiredSkills, minExperience } = req.body;
    
    if (!requiredSkills || !Array.isArray(requiredSkills)) {
      return res.status(400).json({ error: 'requiredSkills must be an array' });
    }

    const candidates = await Candidate.find({ experience: { $gte: minExperience || 0 } });

    const matchedCandidates = candidates.map(candidate => {
      // Normalize skills for case-insensitive matching
      const candidateSkills = candidate.skills.map(s => s.toLowerCase());
      const reqSkillsNormalized = requiredSkills.map(s => s.toLowerCase());

      const matchedSkills = candidateSkills.filter(skill => reqSkillsNormalized.includes(skill));
      
      const score = requiredSkills.length > 0 ? (matchedSkills.length / requiredSkills.length) * 100 : 0;
      
      return {
        ...candidate.toObject(),
        matchScore: score,
        matchedSkillsCount: matchedSkills.length
      };
    }).sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json(matchedCandidates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to match candidates', details: error.message });
  }
});

// 4. AI-Based Candidate Suggestion
app.post('/api/ai/shortlist', async (req, res) => {
  try {
    const { requiredSkills, minExperience, candidates } = req.body;

    if (!process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY === 'your_openrouter_api_key_here') {
      return res.status(500).json({ error: 'OpenRouter API key is not configured' });
    }

    const candidatesListStr = candidates.map((c, index) => 
      `${index + 1}. ${c.name} - Skills: ${c.skills.join(', ')} - Experience: ${c.experience} years ${c.bio ? `- Bio: ${c.bio}` : ''}`
    ).join('\n');

    const prompt = `
      Job requires: ${requiredSkills.join(', ')} (${minExperience || 0}+ years experience)
      Candidates:
      ${candidatesListStr}
      
      Rank these candidates from best to worst based on the job requirements. Provide a structured explanation of why each candidate is suitable or not.
      Format your response as a JSON array where each object has:
      - "candidateName": Name of candidate
      - "rank": integer rank (1 is best)
      - "explanation": Short text explaining the reasoning
      Only output valid JSON. No markdown formatting blocks or extra text.
    `;

    const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
      model: 'openai/gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert HR recruiter AI. Output strictly valid JSON without any markdown formatting.'
        },
        {
          role: 'user',
          content: prompt
        }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let aiResult;
    try {
      const content = response.data.choices[0].message.content;
      // Strip markdown code block wrappers if they exist
      const jsonStr = content.replace(/^```json/m, '').replace(/^```/m, '').trim();
      aiResult = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response:', response.data.choices[0].message.content);
      return res.status(500).json({ error: 'AI returned invalid format', raw: response.data.choices[0].message.content });
    }

    res.status(200).json(aiResult);
  } catch (error) {
    console.error('AI Error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to get AI suggestions', details: error.response?.data || error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
