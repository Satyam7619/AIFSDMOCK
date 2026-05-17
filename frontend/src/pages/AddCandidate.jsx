import React, { useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Save, Plus, X } from 'lucide-react';

const AddCandidate = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    experience: '',
    bio: ''
  });
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setSkills(skills.filter(s => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      await axios.post('http://localhost:5000/api/candidates', {
        ...formData,
        experience: Number(formData.experience),
        skills
      });
      setMessage({ text: 'Candidate added successfully!', type: 'success' });
      setFormData({ name: '', email: '', experience: '', bio: '' });
      setSkills([]);
    } catch (error) {
      setMessage({ text: 'Failed to add candidate.', type: 'error' });
    }
    setLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card" 
      style={{ maxWidth: '600px', margin: '0 auto' }}
    >
      <h2>Add New Candidate</h2>
      {message.text && (
        <div className={`p-4 mb-4 ${message.type === 'success' ? 'badge match-high' : 'badge match-low'}`} style={{ display: 'block', borderRadius: '8px' }}>
          {message.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required placeholder="John Doe" />
        </div>

        <div className="form-group">
          <label>Email Address</label>
          <input type="email" name="email" value={formData.email} onChange={handleChange} required placeholder="john@example.com" />
        </div>

        <div className="form-group">
          <label>Experience (Years)</label>
          <input type="number" name="experience" value={formData.experience} onChange={handleChange} required min="0" step="0.5" placeholder="e.g., 2" />
        </div>

        <div className="form-group">
          <label>Skills</label>
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
            {skills.map((skill, index) => (
              <span key={index} className="badge flex items-center gap-2">
                {skill}
                <X size={14} style={{ cursor: 'pointer' }} onClick={() => removeSkill(skill)} />
              </span>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Bio / Projects</label>
          <textarea name="bio" value={formData.bio} onChange={handleChange} rows="4" placeholder="Short bio or list of projects..."></textarea>
        </div>

        <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
          <Save size={18} />
          {loading ? 'Saving...' : 'Save Candidate'}
        </button>
      </form>
    </motion.div>
  );
};

export default AddCandidate;
