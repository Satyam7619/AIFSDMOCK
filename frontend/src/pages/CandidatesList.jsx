import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { User, Briefcase, Star, Search } from 'lucide-react';

const CandidatesList = () => {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchCandidates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/candidates');
        setCandidates(response.data);
      } catch (error) {
        console.error('Error fetching candidates:', error);
      }
      setLoading(false);
    };
    fetchCandidates();
  }, []);

  const filteredCandidates = candidates.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="container" style={{ padding: 0 }}>
      <div className="flex justify-between items-center mb-4">
        <h2>All Candidates</h2>
        <div className="flex items-center glass-card" style={{ padding: '0.5rem 1rem', borderRadius: '999px' }}>
          <Search size={18} style={{ marginRight: '0.5rem', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search candidates or skills..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', padding: 0, width: '250px' }}
          />
        </div>
      </div>

      {loading ? (
        <p>Loading candidates...</p>
      ) : (
        <div className="grid-2">
          {filteredCandidates.length === 0 ? (
            <p>No candidates found.</p>
          ) : (
            filteredCandidates.map((candidate, index) => (
              <motion.div 
                key={candidate._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="glass-card flex-col gap-4"
              >
                <div className="flex items-center gap-4">
                  <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold' }}>
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0 }}>{candidate.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{candidate.email}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                    <Briefcase size={16} /> <span>{candidate.experience} Years Experience</span>
                  </div>
                  <div className="flex items-center gap-2 mb-2" style={{ color: 'var(--text-muted)' }}>
                    <Star size={16} /> <span>Skills:</span>
                  </div>
                  <div className="flex" style={{ flexWrap: 'wrap', gap: '0.5rem' }}>
                    {candidate.skills.map((skill, i) => (
                      <span key={i} className="badge">{skill}</span>
                    ))}
                  </div>
                </div>

                {candidate.bio && (
                  <div className="mt-4 p-4" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '8px', fontSize: '0.9rem' }}>
                    <p style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>"{candidate.bio}"</p>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CandidatesList;
