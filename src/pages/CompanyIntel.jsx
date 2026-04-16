import React, { useState } from 'react';
import { Search, Building2, Briefcase, ChevronRight, X, DollarSign, FileText, Code, CheckCircle, Lightbulb } from 'lucide-react';
import './CompanyIntel.css';

const COMPANIES_DATA = [
  { id: 1, name: 'Google', difficulty: 'Hard', package: '25 LPA - 60 LPA', icon: 'G', roles: 'Software Engineer, SRE',
    rounds: [{ name: 'Resume Shortlist', icon: <FileText size={16}/> }, { name: 'Phone Screen (DSA)', icon: <Code size={16}/> }, { name: 'Technical Round 1 (DSA)', icon: <Code size={16}/> }, { name: 'Technical Round 2 (System Design)', icon: <Building2 size={16}/> }, { name: 'Googlyness / HR', icon: <Briefcase size={16}/> }],
    topics: ['Graphs', 'Dynamic Programming', 'System Design', 'Tries', 'Trees'],
    tips: ['Focus heavily on Medium/Hard LeetCode problems.', 'Communicate your thought process clearly during the interview.', 'Understand distributed systems basics.']
  },
  { id: 2, name: 'Microsoft', difficulty: 'Hard', package: '20 LPA - 45 LPA', icon: 'M', roles: 'SDE, Program Manager',
    rounds: [{ name: 'Online Assessment', icon: <Code size={16}/> }, { name: 'Technical Round 1', icon: <Code size={16}/> }, { name: 'Technical Round 2', icon: <Code size={16}/> }, { name: 'As-App (Managerial)', icon: <Briefcase size={16}/> }],
    topics: ['Linked Lists', 'Trees', 'System Design', 'OOPs', 'Strings'],
    tips: ['Strong grasp on fundamental CS concepts (OS, DBMS).', 'Practice writing clean code on whiteboard/paper.', 'Be ready to explain your projects deeply.']
  },
  { id: 3, name: 'Amazon', difficulty: 'Hard', package: '22 LPA - 50 LPA', icon: 'A', roles: 'SDE 1, SDE 2',
    rounds: [{ name: 'Online Assessment', icon: <Code size={16}/> }, { name: 'Technical Round 1', icon: <Code size={16}/> }, { name: 'Technical Round 2', icon: <Code size={16}/> }, { name: 'Bar Raiser', icon: <Briefcase size={16}/> }],
    topics: ['Data Structures', 'Algorithms', 'Leadership Principles', 'System Design'],
    tips: ['Memorize and prepare stories for Amazon Leadership Principles.', 'Focus on optimization (Time/Space complexity).', 'Expect behavioral questions in every round.']
  },
  { id: 4, name: 'TCS', difficulty: 'Easy', package: '3.3 LPA - 7 LPA', icon: 'T', roles: 'Ninja, Digital, Prime',
    rounds: [{ name: 'NQT (Aptitude + Coding)', icon: <FileText size={16}/> }, { name: 'Technical Interview', icon: <Code size={16}/> }, { name: 'Managerial Round', icon: <Briefcase size={16}/> }, { name: 'HR Round', icon: <Briefcase size={16}/> }],
    topics: ['Aptitude', 'Basic Programming', 'SQL', 'OOPs', 'Communication'],
    tips: ['Speed and accuracy in the Aptitude section are crucial.', 'Brush up on basic SQL queries and OOP concepts.', 'Be confident and clear in the HR round.']
  },
  { id: 5, name: 'Infosys', difficulty: 'Easy', package: '3.6 LPA - 8 LPA', icon: 'I', roles: 'System Engineer, Specialist Programmer',
    rounds: [{ name: 'Online Test (Aptitude)', icon: <FileText size={16}/> }, { name: 'Coding Round (For SP)', icon: <Code size={16}/> }, { name: 'Technical Interview', icon: <Code size={16}/> }, { name: 'HR Interview', icon: <Briefcase size={16}/> }],
    topics: ['Aptitude', 'Logical Reasoning', 'Basic DSA', 'DBMS'],
    tips: ['Focus on puzzles and logical reasoning.', 'Know your resume inside out.', 'Basic coding knowledge in C++/Java/Python is sufficient for SE role.']
  },
  { id: 6, name: 'Wipro', difficulty: 'Easy', package: '3.5 LPA - 6.5 LPA', icon: 'W', roles: 'Project Engineer, Turbo',
    rounds: [{ name: 'Aptitude & Essay', icon: <FileText size={16}/> }, { name: 'Coding Test', icon: <Code size={16}/> }, { name: 'Technical Round', icon: <Code size={16}/> }, { name: 'HR Round', icon: <Briefcase size={16}/> }],
    topics: ['Quantitative Aptitude', 'Written English', 'Core Subjects'],
    tips: ['Practice writing short essays with good grammar.', 'Review basic concepts of OS, Networking, and DBMS.', 'Communication skills matter heavily.']
  },
  { id: 7, name: 'Adobe', difficulty: 'Hard', package: '20 LPA - 40 LPA', icon: 'Ad', roles: 'Member of Technical Staff',
    rounds: [{ name: 'Aptitude + Coding Test', icon: <FileText size={16}/> }, { name: 'Technical Round 1', icon: <Code size={16}/> }, { name: 'Technical Round 2', icon: <Code size={16}/> }, { name: 'Director Round', icon: <Briefcase size={16}/> }],
    topics: ['Math/Puzzles', 'Advanced DSA', 'OS Concepts', 'System Design'],
    tips: ['Expect OS and Memory Management specific questions.', 'Practice standard mathematical puzzles.', 'Be prepared for in-depth algorithmic discussions.']
  },
  { id: 8, name: 'Flipkart', difficulty: 'Hard', package: '25 LPA - 32 LPA', icon: 'F', roles: 'SDE 1',
    rounds: [{ name: 'Online Coding Test', icon: <Code size={16}/> }, { name: 'Machine Coding Round', icon: <Code size={16}/> }, { name: 'PSDS Round', icon: <Code size={16}/> }, { name: 'Hiring Manager Round', icon: <Briefcase size={16}/> }],
    topics: ['Machine Coding', 'DSA', 'LLD', 'Project Architecture'],
    tips: ['Machine coding round is crucial - practice building functioning console apps in 90 mins.', 'Focus on clean, structured, and extensible code.', 'LLD (Low-Level Design) is heavily tested.']
  }
];

const CompanyIntel = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);

  const filteredCompanies = COMPANIES_DATA.filter(ci => 
    ci.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getDifficultyColor = (diff) => {
    if (diff === 'Easy') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (diff === 'Medium') return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (diff === 'Hard') return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
    return 'bg-slate-500/10 text-slate-400';
  };

  return (
    <div className="intel-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Know Your Dream Companies</h1>
        <p className="page-subtitle">Inside scoop on hiring processes, salaries, and preparation tips.</p>
      </div>

      <div className="search-container">
        <div className="search-bar">
          <Search size={20} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search for companies (e.g., Google, TCS...)" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="companies-grid">
        {filteredCompanies.map(company => (
          <div key={company.id} className="company-card glass-card hover-up">
            <div className="company-card-header">
              <div className="company-logo gradient-logo">
                {company.icon}
              </div>
              <span className={`diff-tag border ${getDifficultyColor(company.difficulty)}`}>
                {company.difficulty}
              </span>
            </div>
            <h3 className="company-name">{company.name}</h3>
            <p className="company-roles">{company.roles}</p>
            
            <button 
              className="btn btn-outline view-details-btn"
              onClick={() => setSelectedCompany(company)}
            >
              View Details <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <div className="no-results">
          <Building2 size={48} className="text-muted" />
          <p>No companies found matching "{searchTerm}"</p>
        </div>
      )}

      {/* Details Modal */}
      {selectedCompany && (
        <div className="modal-overlay fade-in" onClick={() => setSelectedCompany(null)}>
          <div className="modal-content glass-card slide-up" onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSelectedCompany(null)}>
              <X size={24} />
            </button>

            <div className="modal-header">
              <div className="company-logo large gradient-logo">{selectedCompany.icon}</div>
              <div>
                <h2>{selectedCompany.name}</h2>
                <div className="modal-meta">
                  <span className={`diff-tag border ${getDifficultyColor(selectedCompany.difficulty)}`}>
                    {selectedCompany.difficulty}
                  </span>
                  <span className="package-tag">
                    <DollarSign size={14} /> {selectedCompany.package}
                  </span>
                </div>
              </div>
            </div>

            <div className="modal-body grid-2">
              <div className="left-panel">
                <h3><Briefcase size={18}/> Hiring Rounds</h3>
                <div className="timeline-container">
                  {selectedCompany.rounds.map((round, idx) => (
                    <div key={idx} className="timeline-item">
                      <div className="timeline-node">{round.icon}</div>
                      <div className="timeline-content">
                        <h4>Step {idx + 1}</h4>
                        <p>{round.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="right-panel">
                <div className="mb-4">
                  <h3><BookOpen size={18}/> Topics to Prepare</h3>
                  <div className="tags-container mt-2">
                    {selectedCompany.topics.map((topic, i) => (
                      <span key={i} className="topic-tag">{topic}</span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3><Lightbulb size={18}/> Preparation Tips</h3>
                  <ul className="tips-list mt-2">
                    {selectedCompany.tips.map((tip, i) => (
                      <li key={i}>
                        <CheckCircle size={16} className="tip-icon" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn btn-primary btn-block" onClick={() => setSelectedCompany(null)}>Got It</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Assuming BookOpen might be missing from this file's imports, safe re-import
import { BookOpen } from 'lucide-react';

export default CompanyIntel;
