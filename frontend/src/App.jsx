import React from 'react';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import { Users, UserPlus, Zap } from 'lucide-react';
import AddCandidate from './pages/AddCandidate';
import CandidatesList from './pages/CandidatesList';
import Shortlist from './pages/Shortlist';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <div className="container">
        <header className="mb-4">
          <h1 className="text-gradient flex items-center gap-2">
            <Zap size={32} color="#ec4899" /> 
            AI-Powered Candidate Matcher
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Intelligently find the perfect fit for your roles.</p>
        </header>
        
        <nav>
          <NavLink to="/" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
            <UserPlus size={18} /> Add Candidate
          </NavLink>
          <NavLink to="/candidates" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
            <Users size={18} /> All Candidates
          </NavLink>
          <NavLink to="/shortlist" className={({isActive}) => isActive ? "nav-link active flex items-center gap-2" : "nav-link flex items-center gap-2"}>
            <Zap size={18} /> Shortlist AI
          </NavLink>
        </nav>

        <main>
          <Routes>
            <Route path="/" element={<AddCandidate />} />
            <Route path="/candidates" element={<CandidatesList />} />
            <Route path="/shortlist" element={<Shortlist />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
