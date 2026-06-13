import React, { useState, useEffect } from 'react';
import { Award, Briefcase, Code2, ShieldAlert, BadgeInfo, Calendar, Link as LinkIcon, DownloadCloud, UploadCloud, FileText, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './PortfolioTracker.css';

const MOCK_DATA = {
  certifications: [
    { id: 1, name: 'AWS Certified Cloud Practitioner', platform: 'Amazon Web Services', date: 'Oct 2025' },
    { id: 2, name: 'Meta Front-End Developer', platform: 'Coursera', date: 'Aug 2025' }
  ],
  projects: [
    { id: 1, title: 'Pathnexis Platform', stack: ['React', 'Node.js', 'MongoDB'], github: 'github.com/pathnexis', description: 'AI driven placement readiness tracker.' },
    { id: 2, title: 'Crypto Wallet', stack: ['Flutter', 'Firebase'], github: 'github.com/cryptowallet', description: 'Cross platform mobile wallet for managing cryptocurrency.' }
  ],
  hackathons: [
    { id: 1, name: 'Smart India Hackathon', organizer: 'Govt of India', rank: 'Top 10 Finalist', year: '2024' },
    { id: 2, name: 'HackTheNorth', organizer: 'University of Waterloo', rank: 'Participant', year: '2025' }
  ],
  dsa: {
    leetcode: 145,
    gfg: 80,
    hackerrank: 40
  }
};

const PortfolioTracker = () => {
  const { currentUser, isDemo } = useAuth();
  const [activeTab, setActiveTab] = useState('certifications');
  
  const [certs, setCerts] = useState(MOCK_DATA.certifications);
  const [projects, setProjects] = useState(MOCK_DATA.projects);
  const [hackathons, setHackathons] = useState(MOCK_DATA.hackathons);
  
  const [certForm, setCertForm] = useState({ name: '', platform: '', date: '' });
  const [projForm, setProjForm] = useState({ title: '', stack: '', github: '', description: '' });
  const [hackForm, setHackForm] = useState({ name: '', organizer: '', rank: '', year: '' });
  
  const [dsaInput, setDsaInput] = useState({ leetcode: MOCK_DATA.dsa.leetcode });
  const [leetcodeUsername, setLeetcodeUsername] = useState('');
  const [leetcodeAiAnalysis, setLeetcodeAiAnalysis] = useState('');
  const [isLeetcodeLoading, setIsLeetcodeLoading] = useState(false);

  const [githubUsername, setGithubUsername] = useState('');
  const [githubData, setGithubData] = useState(null);
  const [githubAiAnalysis, setGithubAiAnalysis] = useState('');
  const [isGithubLoading, setIsGithubLoading] = useState(false);

  useEffect(() => {
    const loadPortfolio = async () => {
      if (!currentUser) return;
      
      // Load local storage backup first for instant renders and offline fallback
      const storageKey = isDemo ? `pathnexis_portfolio_demo` : `pathnexis_portfolio_${currentUser.uid}`;
      const localData = localStorage.getItem(storageKey);
      if (localData) {
        try {
          const port = JSON.parse(localData);
          if (port.certs) setCerts(port.certs);
          if (port.projects) setProjects(port.projects);
          if (port.hackathons) setHackathons(port.hackathons);
          if (port.dsa) setDsaInput(port.dsa);
          if (port.githubData) setGithubData(port.githubData);
          if (port.leetcodeUsername) setLeetcodeUsername(port.leetcodeUsername);
          if (port.leetcodeAiAnalysis) setLeetcodeAiAnalysis(port.leetcodeAiAnalysis);
          if (port.githubUsername) setGithubUsername(port.githubUsername);
          if (port.githubAiAnalysis) setGithubAiAnalysis(port.githubAiAnalysis);
        } catch (e) {
          console.warn("Failed to parse local portfolio backup:", e);
        }
      }

      // Sync from MongoDB in the background
      try {
        const res = await fetch(`http://localhost:3000/api/portfolio/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === "success" && data.portfolio) {
            const port = data.portfolio;
            if (port.certs) setCerts(port.certs);
            if (port.projects) setProjects(port.projects);
            if (port.hackathons) setHackathons(port.hackathons);
            if (port.dsa) setDsaInput(port.dsa);
            if (port.githubData) setGithubData(port.githubData);
            if (port.leetcodeUsername) setLeetcodeUsername(port.leetcodeUsername);
            if (port.leetcodeAiAnalysis) setLeetcodeAiAnalysis(port.leetcodeAiAnalysis);
            if (port.githubUsername) setGithubUsername(port.githubUsername);
            if (port.githubAiAnalysis) setGithubAiAnalysis(port.githubAiAnalysis);
            
            // Re-sync local backup
            localStorage.setItem(storageKey, JSON.stringify(port));
          }
        }
      } catch (err) {
        console.error("Failed to load portfolio from MongoDB, using local backup:", err);
      }
    };
    loadPortfolio();
  }, [currentUser]);

  const savePortfolioToLocal = async (newCerts, newProjects, newHackathons, newDsa, newGithub, extra = {}) => {
    if (!currentUser) return;
    const payload = {
      certs: newCerts || certs,
      projects: newProjects || projects,
      hackathons: newHackathons || hackathons,
      dsa: newDsa || dsaInput,
      githubData: newGithub || githubData,
      leetcodeUsername: extra.leetcodeUsername !== undefined ? extra.leetcodeUsername : leetcodeUsername,
      leetcodeSolved: (newDsa || dsaInput).leetcode,
      leetcodeAiAnalysis: extra.leetcodeAiAnalysis !== undefined ? extra.leetcodeAiAnalysis : leetcodeAiAnalysis,
      githubUsername: extra.githubUsername !== undefined ? extra.githubUsername : githubUsername,
      githubAiAnalysis: extra.githubAiAnalysis !== undefined ? extra.githubAiAnalysis : githubAiAnalysis
    };
    
    // Instantly save to local storage backup for offline reliability
    const storageKey = isDemo ? `pathnexis_portfolio_demo` : `pathnexis_portfolio_${currentUser.uid}`;
    localStorage.setItem(storageKey, JSON.stringify(payload));

    try {
      await fetch(`http://localhost:3000/api/portfolio/${currentUser.uid}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.error("Failed to save portfolio data to MongoDB:", err);
    }
  };

  const addPortfolioItem = async (type, data) => {
    const item = { ...data, id: Date.now(), createdAt: new Date().toISOString() };
    if (type === 'certification') {
      const updated = [item, ...certs];
      setCerts(updated);
      savePortfolioToLocal(updated, projects, hackathons);
    }
    if (type === 'project') {
      const updated = [item, ...projects];
      setProjects(updated);
      savePortfolioToLocal(certs, updated, hackathons);
    }
    if (type === 'hackathon') {
      const updated = [item, ...hackathons];
      setHackathons(updated);
      savePortfolioToLocal(certs, projects, updated);
    }
  };

  const handleDeleteItem = (type, id) => {
    if (window.confirm(`Are you sure you want to delete this ${type}?`)) {
      if (type === 'certification') {
        const updated = certs.filter(c => c.id !== id);
        setCerts(updated);
        savePortfolioToLocal(updated, projects, hackathons);
      } else if (type === 'project') {
        const updated = projects.filter(p => p.id !== id);
        setProjects(updated);
        savePortfolioToLocal(certs, updated, hackathons);
      } else if (type === 'hackathon') {
        const updated = hackathons.filter(h => h.id !== id);
        setHackathons(updated);
        savePortfolioToLocal(certs, projects, updated);
      }
    }
  };

  const handleAddCert = async (e) => {
    e.preventDefault();
    if (!certForm.name) return;
    await addPortfolioItem('certification', { ...certForm });
    setCertForm({ name: '', platform: '', date: '' });
  };

  const handleAddProj = async (e) => {
    e.preventDefault();
    if (!projForm.title) return;
    await addPortfolioItem('project', { ...projForm, stack: projForm.stack.split(',') });
    setProjForm({ title: '', stack: '', github: '', description: '' });
  };

  const handleAddHack = async (e) => {
    e.preventDefault();
    if (!hackForm.name) return;
    await addPortfolioItem('hackathon', { ...hackForm });
    setHackForm({ name: '', organizer: '', rank: '', year: '' });
  };

  const fetchLeetcodeStats = async () => {
    if(!leetcodeUsername) return;
    setIsLeetcodeLoading(true);
    try {
      // Calling our custom Node.js backend to bypass CORS
      const res = await fetch(`http://localhost:3000/api/leetcode/${leetcodeUsername}`);
      const data = await res.json();
      
      if (data.status === "success") {
        const newDsa = { ...dsaInput, leetcode: data.totalSolved || 0 };
        setDsaInput(newDsa);
        savePortfolioToLocal(certs, projects, hackathons, newDsa, githubData);
        generateLeetcodeAnalysis(data);
      } else {
        alert("LeetCode user not found or private profile.");
      }
    } catch(err) {
      console.warn("Failed to fetch LeetCode stats", err);
      alert('Unable to fetch LeetCode stats. Please enter manually.');
    }
    setIsLeetcodeLoading(false);
  };

  const generateLeetcodeAnalysis = async (data) => {
    if (!data.totalSolved) return;
    try {
      const prompt = `You are an expert AI technical recruiter. A candidate has solved ${data.totalSolved} LeetCode problems (Easy: ${data.easy}, Medium: ${data.medium}, Hard: ${data.hard}). Write a 2-3 sentence personalized analysis highlighting their problem-solving proficiency and suggesting their next area of focus. Keep it encouraging and professional.`;
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) return setLeetcodeAiAnalysis("Add Gemini API Key to see AI Analysis.");
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const responseData = await res.json();
      if (responseData.candidates && responseData.candidates.length > 0) {
        const text = responseData.candidates[0].content.parts[0].text;
        setLeetcodeAiAnalysis(text);
        savePortfolioToLocal(certs, projects, hackathons, dsaInput, githubData, { leetcodeAiAnalysis: text });
      }
    } catch (err) {
      console.error("Failed to generate LeetCode AI analysis", err);
    }
  };

  const fetchGithubStats = async () => {
    if(!githubUsername) return;
    setIsGithubLoading(true);
    try {
      const res = await fetch(`http://localhost:3000/api/github/${githubUsername}`);
      const data = await res.json();
      if (data.status === "success") {
        setGithubData(data);
        savePortfolioToLocal(certs, projects, hackathons, dsaInput, data);
        generateGithubDNAAnalysis(data.languageStats);
      } else {
        alert("GitHub user not found.");
      }
    } catch(err) {
      console.error("Failed to fetch GitHub stats", err);
      alert('Unable to fetch GitHub stats.');
    }
    setIsGithubLoading(false);
  };

  const generateGithubDNAAnalysis = async (languageStats) => {
    if (!languageStats || languageStats.length === 0) return;
    try {
      const topLangs = languageStats.slice(0, 3).map(l => `${l.language} (${l.percentage}%)`).join(', ');
      const prompt = `You are a technical recruiter AI. A candidate has the following top programming languages based on their GitHub repositories: ${topLangs}. Write a 2-3 sentence personalized "Developer DNA" analysis highlighting their strengths and suggesting one potential area of growth. Keep it encouraging and professional.`;
      const apiKey = import.meta.env.VITE_API_KEY;
      if (!apiKey) return setGithubAiAnalysis("Add Gemini API Key to see AI Analysis.");
      
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await res.json();
      if (data.candidates && data.candidates.length > 0) {
        const text = data.candidates[0].content.parts[0].text;
        setGithubAiAnalysis(text);
        savePortfolioToLocal(certs, projects, hackathons, dsaInput, githubData, { githubAiAnalysis: text });
      }
    } catch (err) {
      console.error("Failed to generate AI analysis", err);
    }
  };

  const handleDsaChange = (e) => {
    const newDsa = {...dsaInput, [e.target.name]: Number(e.target.value)};
    setDsaInput(newDsa);
    savePortfolioToLocal(certs, projects, hackathons, newDsa, githubData);
  };

  const totalDsa = dsaInput.leetcode || 0;
  const dsaTarget = 500;
  const pbPercent = Math.min((totalDsa / dsaTarget) * 100, 100);

  return (
    <div className="portfolio-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Your Achievement Vault 🏆</h1>
        <p className="page-subtitle">Centralize your projects, certifications, hackathons, and DSA progress.</p>
      </div>

      <div className="portfolio-tabs glass-card">
        <button className={`tab-btn ${activeTab === 'certifications' ? 'active' : ''}`} onClick={() => setActiveTab('certifications')}>
          <Award size={18} /> Certifications
        </button>
        <button className={`tab-btn ${activeTab === 'projects' ? 'active' : ''}`} onClick={() => setActiveTab('projects')}>
          <Briefcase size={18} /> Projects
        </button>
        <button className={`tab-btn ${activeTab === 'hackathons' ? 'active' : ''}`} onClick={() => setActiveTab('hackathons')}>
          <ShieldAlert size={18} /> Hackathons
        </button>
        <button className={`tab-btn ${activeTab === 'dsa' ? 'active' : ''}`} onClick={() => setActiveTab('dsa')}>
          <Code2 size={18} /> DSA Progress
        </button>
        <button className={`tab-btn ${activeTab === 'github' ? 'active' : ''}`} onClick={() => setActiveTab('github')}>
          <Code2 size={18} /> Developer DNA
        </button>
      </div>

      <div className="tab-content-area">
        {/* CERTIFICATIONS TAB */}
        {activeTab === 'certifications' && (
          <div className="tab-pane fade-in">
            <div className="form-card glass-card mb-4">
              <h3>Add New Certification</h3>
              <form className="add-form" onSubmit={handleAddCert}>
                <input required type="text" placeholder="Certification Name" className="glass-input" value={certForm.name} onChange={e => setCertForm({...certForm, name: e.target.value})} />
                <select required className="glass-input" value={certForm.platform} onChange={e => setCertForm({...certForm, platform: e.target.value})}>
                  <option value="" disabled>Select Platform</option>
                  <option value="Amazon Web Services">AWS</option>
                  <option value="Coursera">Coursera</option>
                  <option value="Udemy">Udemy</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Google">Google</option>
                  <option value="Other">Other</option>
                </select>
                <input required type="text" placeholder="Date (e.g. Aug 2025)" className="glass-input" value={certForm.date} onChange={e => setCertForm({...certForm, date: e.target.value})} />
                <button type="submit" className="btn btn-primary">Add</button>
              </form>
            </div>

            <div className="cards-grid">
              {certs.map(cert => (
                <div key={cert.id} className="item-card glass-card hover-up">
                  <button className="delete-btn" title="Delete Certification" onClick={() => handleDeleteItem('certification', cert.id)}>
                    <Trash2 size={16} />
                  </button>
                  <div className="icon-wrap"><Award /></div>
                  <div className="item-details">
                    <h4>{cert.name}</h4>
                    <p><BadgeInfo size={14}/> {cert.platform}</p>
                    <p><Calendar size={14}/> {cert.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="tab-pane fade-in">
            <div className="form-card glass-card mb-4">
              <h3>Add New Project</h3>
              <form className="add-form proj-form" onSubmit={handleAddProj}>
                <input required type="text" placeholder="Project Title" className="glass-input full-w" value={projForm.title} onChange={e => setProjForm({...projForm, title: e.target.value})} />
                <input required type="text" placeholder="Tech Stack (comma separated)" className="glass-input" value={projForm.stack} onChange={e => setProjForm({...projForm, stack: e.target.value})} />
                <input required type="text" placeholder="GitHub Link" className="glass-input" value={projForm.github} onChange={e => setProjForm({...projForm, github: e.target.value})} />
                <textarea required placeholder="Short Description" className="glass-input full-w" rows="2" value={projForm.description} onChange={e => setProjForm({...projForm, description: e.target.value})}></textarea>
                <button type="submit" className="btn btn-primary btn-block">Add Project</button>
              </form>
            </div>

            <div className="cards-grid">
              {projects.map(proj => (
                <div key={proj.id} className="item-card project glass-card hover-up">
                  <button className="delete-btn" title="Delete Project" onClick={() => handleDeleteItem('project', proj.id)}>
                    <Trash2 size={16} />
                  </button>
                  <h4>{proj.title}</h4>
                  <div className="stack-tags">
                    {proj.stack.map((s, i) => <span key={i} className="stack-tag">{s.trim()}</span>)}
                  </div>
                  <p className="proj-desc">{proj.description}</p>
                  <a href={`https://${proj.github}`} target="_blank" rel="noopener noreferrer" className="github-link"><LinkIcon size={14}/> {proj.github}</a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HACKATHONS TAB */}
        {activeTab === 'hackathons' && (
          <div className="tab-pane fade-in">
            <div className="form-card glass-card mb-4">
              <h3>Add Hackathon Experience</h3>
              <form className="add-form" onSubmit={handleAddHack}>
                <input required type="text" placeholder="Hackathon Name" className="glass-input" value={hackForm.name} onChange={e => setHackForm({...hackForm, name: e.target.value})} />
                <input required type="text" placeholder="Organizer (e.g. MLH)" className="glass-input" value={hackForm.organizer} onChange={e => setHackForm({...hackForm, organizer: e.target.value})} />
                <input required type="text" placeholder="Rank/Achievement" className="glass-input" value={hackForm.rank} onChange={e => setHackForm({...hackForm, rank: e.target.value})} />
                <input required type="text" placeholder="Year" className="glass-input" value={hackForm.year} onChange={e => setHackForm({...hackForm, year: e.target.value})} />
                <button type="submit" className="btn btn-primary full-w mt-2">Add</button>
              </form>
            </div>

            <div className="timeline-cards">
              {hackathons.map((hack, index) => (
                <div key={hack.id} className="timeline-card glass-card">
                  <button className="delete-btn" title="Delete Hackathon" onClick={() => handleDeleteItem('hackathon', hack.id)}>
                    <Trash2 size={16} />
                  </button>
                  <div className="year-bubble">{hack.year}</div>
                  <div className="timeline-info">
                    <h4>{hack.name}</h4>
                    <p className="org">{hack.organizer}</p>
                    <p className="rank-tag">{hack.rank}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DSA TAB */}
        {activeTab === 'dsa' && (
          <div className="tab-pane fade-in">
            <div className="dsa-overview glass-card mb-4">
              <h3>Overall Problem Solving</h3>
              <div className="dsa-progress-bar-bg">
                <div className="dsa-progress-fill" style={{width: `${pbPercent}%`}}></div>
              </div>
              <div className="dsa-stats-text">
                <span>{totalDsa} Problems Solved</span>
                <span>Target: {dsaTarget}</span>
              </div>
            </div>

            <div className="cards-grid dsa-grid" style={{gridTemplateColumns: '1fr'}}>
              <div className="platform-card glass-card">
                <div className="plat-header">
                  <span className="plat-logo leetcode">LC</span>
                  <h4>LeetCode Sync</h4>
                </div>
                <div className="plat-input-group">
                  <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                    <input type="text" placeholder="Username" className="glass-input" style={{flex: 1}} value={leetcodeUsername} onChange={e => setLeetcodeUsername(e.target.value)} />
                    <button className="btn btn-outline" style={{padding: '0 10px'}} onClick={fetchLeetcodeStats} disabled={isLeetcodeLoading}>
                      {isLeetcodeLoading ? 'Syncing...' : 'Sync'}
                    </button>
                  </div>
                  <label>Total Problems Solved</label>
                  <input type="number" name="leetcode" className="glass-input" value={dsaInput.leetcode} onChange={handleDsaChange} style={{width: '100px'}}/>
                </div>
                
                {leetcodeAiAnalysis && (
                  <div className="github-ai-card glass-card" style={{marginTop: '1.5rem'}}>
                    <div className="ai-header">
                      <span className="ai-icon">✨</span>
                      <h4>AI Problem Solving Analysis</h4>
                    </div>
                    <p className="ai-text">{leetcodeAiAnalysis}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* DEVELOPER DNA TAB */}
        {activeTab === 'github' && (
          <div className="tab-pane fade-in">
            <div className="form-card glass-card mb-4">
              <h3>GitHub Synchronization</h3>
              <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                <input type="text" placeholder="GitHub Username" className="glass-input" style={{flex: 1}} value={githubUsername} onChange={e => setGithubUsername(e.target.value)} />
                <button className="btn btn-primary" onClick={fetchGithubStats} disabled={isGithubLoading}>
                  {isGithubLoading ? 'Syncing...' : 'Sync Profile'}
                </button>
              </div>
            </div>

            {githubData && (
              <div className="github-dashboard">
                <div className="github-profile-card glass-card">
                  <img src={githubData.profile.avatar} alt="Avatar" className="github-avatar" />
                  <div className="github-info">
                    <h4>{githubData.profile.name || githubUsername}</h4>
                    <p>{githubData.profile.bio}</p>
                    <div className="github-stats">
                      <span><strong>{githubData.profile.followers}</strong> Followers</span>
                      <span><strong>{githubData.profile.publicRepos}</strong> Repositories</span>
                    </div>
                  </div>
                </div>

                {githubAiAnalysis && (
                  <div className="github-ai-card glass-card">
                    <div className="ai-header">
                      <span className="ai-icon">✨</span>
                      <h4>AI Developer DNA Analysis</h4>
                    </div>
                    <p className="ai-text">{githubAiAnalysis}</p>
                  </div>
                )}

                <div className="github-grid">
                  <div className="github-langs glass-card">
                    <h4>Language Distribution</h4>
                    <div className="lang-list">
                      {githubData.languageStats.map(lang => (
                        <div key={lang.language} className="lang-item">
                          <div className="lang-label">
                            <span>{lang.language}</span>
                            <span>{lang.percentage}%</span>
                          </div>
                          <div className="lang-bar-bg">
                            <div className="lang-bar-fill" style={{width: `${lang.percentage}%`}}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="github-repos glass-card">
                    <h4>Top Repositories</h4>
                    <div className="repo-list">
                      {githubData.topRepos.map(repo => (
                        <a key={repo.name} href={repo.url} target="_blank" rel="noopener noreferrer" className="repo-card hover-up">
                          <h5>{repo.name}</h5>
                          <p>{repo.description || "No description"}</p>
                          <div className="repo-meta">
                            <span className="repo-lang"><span className="lang-dot"></span>{repo.language || 'Unknown'}</span>
                            <span className="repo-stars">⭐ {repo.stars}</span>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PortfolioTracker;
