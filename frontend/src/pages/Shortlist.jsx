import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Search, Zap, CheckCircle2, AlertCircle, Plus, X } from 'lucide-react';

const Shortlist = () => {
  const [jobReq, setJobReq] = useState({
    minExperience: ''
  });
  const [requiredSkills, setRequiredSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  
  const [results, setResults] = useState([]);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleBasicMatch = async () => {
    if (requiredSkills.length === 0) {
      setError('Please add at least one required skill');
      return;
    }
    
    setLoading(true);
    setError('');
    setAiSuggestions(null);

    try {
      const response = await axios.post('http://localhost:5000/api/match', {
        requiredSkills,
        minExperience: Number(jobReq.minExperience) || 0
      });
      setResults(response.data);
    } catch (err) {
      setError('Failed to fetch basic matches.');
    }
    setLoading(false);
  };

  const handleAiShortlist = async () => {
    if (results.length === 0) {
      setError('Please run basic match first to gather candidates.');
      return;
    }
    
    setAiLoading(true);
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/ai/shortlist', {
        requiredSkills,
        minExperience: Number(jobReq.minExperience) || 0,
        candidates: results.slice(0, 10) // Send top 10 to AI to save tokens
      });
      setAiSuggestions(response.data);
    } catch (err) {
      setError('Failed to get AI suggestions. Make sure OPENROUTER_API_KEY is valid.');
    }
    setAiLoading(false);
  };

  return (
    <div className="grid-2">
      {/* Left Column: Job Requirements */}
      <div>
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="glass-card mb-4"
        >
          <h2>Job Requirements</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Enter the skills and experience required for the position.
          </p>
          
          <div className="form-group">
            <label>Required Skills</label>
            <div className="flex gap-2 mb-2">
              <input 
                type="text" 
                value={skillInput} 
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="e.g., React, Node.js"
                onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              />
              <button type="button" className="btn btn-outline" onClick={handleAddSkill}>
                <Plus size={18} />
              </button>
            </div>
            <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
              {requiredSkills.map((skill, index) => (
                <span key={index} className="badge flex items-center gap-2">
                  {skill}
                  <X size={14} style={{ cursor: 'pointer' }} onClick={() => setRequiredSkills(requiredSkills.filter(s => s !== skill))} />
                </span>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Minimum Experience (Years)</label>
            <input 
              type="number" 
              value={jobReq.minExperience} 
              onChange={(e) => setJobReq({ ...jobReq, minExperience: e.target.value })}
              min="0" step="0.5" placeholder="e.g., 2"
            />
          </div>

          {error && (
            <div className="badge match-low mb-4" style={{ display: 'block', borderRadius: '8px', padding: '1rem' }}>
              {error}
            </div>
          )}

          <div className="flex gap-4 mt-4">
            <button className="btn btn-outline" onClick={handleBasicMatch} disabled={loading} style={{ flex: 1 }}>
              <Search size={18} /> {loading ? 'Matching...' : 'Basic Match'}
            </button>
            <button className="btn btn-primary" onClick={handleAiShortlist} disabled={aiLoading || results.length === 0} style={{ flex: 1 }}>
              <Zap size={18} /> {aiLoading ? 'Analyzing...' : 'AI Shortlist'}
            </button>
          </div>
        </motion.div>

        {aiSuggestions && Array.isArray(aiSuggestions) && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mt-4"
            style={{ border: '1px solid var(--primary-color)' }}
          >
            <h3 className="flex items-center gap-2 text-gradient">
              <Zap size={20} /> AI Recommendations
            </h3>
            <div className="flex-col gap-4 mt-4">
              {aiSuggestions.map((suggestion, idx) => (
                <div key={idx} className="ai-box" style={{ marginLeft: 0, borderRadius: '8px' }}>
                  <div className="flex justify-between items-center mb-2">
                    <strong style={{ fontSize: '1.1rem' }}>{suggestion.candidateName}</strong>
                    <span className="badge match-high">Rank #{suggestion.rank}</span>
                  </div>
                  <p style={{ color: 'var(--text-muted)' }}>{suggestion.explanation}</p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {/* Right Column: Results */}
      <div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2>Matched Candidates</h2>
            <span className="badge">{results.length} found</span>
          </div>

          <div className="flex-col gap-4">
            {results.map((candidate, index) => {
              const matchPercentage = Math.round(candidate.matchScore);
              
              let matchClass = 'match-high';
              if (matchPercentage < 50) matchClass = 'match-low';
              else if (matchPercentage < 80) matchClass = 'match-medium';

              const aiRec = aiSuggestions?.find(ai => ai.candidateName === candidate.name);

              return (
                <motion.div 
                  key={candidate._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`glass-card ${aiRec ? 'ai-highlight' : ''}`}
                  style={aiRec ? { borderColor: 'var(--primary-color)', boxShadow: '0 0 15px rgba(99,102,241,0.2)' } : {}}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 style={{ margin: 0 }}>{candidate.name}</h3>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{candidate.experience} Years Exp.</p>
                    </div>
                    <div className={`badge ${matchClass} flex items-center gap-2`} style={{ fontSize: '1rem', padding: '0.5rem 1rem' }}>
                      {matchPercentage >= 80 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                      {matchPercentage}% Match
                    </div>
                  </div>

                  <div className="mt-4">
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Skills Match ({candidate.matchedSkillsCount}/{requiredSkills.length})</p>
                    <div className="progress-bg">
                      <div className="progress-fill" style={{ width: `${matchPercentage}%`, background: matchClass === 'match-low' ? 'var(--danger)' : matchClass === 'match-medium' ? 'var(--warning)' : 'var(--success)' }}></div>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2" style={{ flexWrap: 'wrap' }}>
                    {candidate.skills.map((skill, i) => {
                      const isMatched = requiredSkills.map(s => s.toLowerCase()).includes(skill.toLowerCase());
                      return (
                        <span key={i} className={`badge ${isMatched ? 'match-high' : ''}`} style={!isMatched ? { opacity: 0.5 } : {}}>
                          {skill}
                        </span>
                      );
                    })}
                  </div>

                  {aiRec && (
                    <div className="ai-box">
                      <strong>AI Insight: </strong> {aiRec.explanation}
                    </div>
                  )}
                </motion.div>
              );
            })}

            {results.length === 0 && !loading && (
              <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <Search size={48} color="var(--text-muted)" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <h3 style={{ color: 'var(--text-muted)' }}>No matches yet</h3>
                <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem' }}>Enter requirements and run a basic match.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Shortlist;
