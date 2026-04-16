import React, { useState, useEffect } from 'react';
import { Award, Briefcase, Code2, ShieldAlert, BadgeInfo, Calendar, Link as LinkIcon, DownloadCloud, UploadCloud, FileText } from 'lucide-react';
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
  
  const [dsaInput, setDsaInput] = useState({ leetcode: MOCK_DATA.dsa.leetcode, gfg: MOCK_DATA.dsa.gfg, hackerrank: MOCK_DATA.dsa.hackerrank });
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  useEffect(() => {
    if (isDemo || !currentUser) return;
    const saved = localStorage.getItem(`pathnexis_portfolio_${currentUser.uid}`);
    if (saved) {
      const data = JSON.parse(saved);
      if (data.certs) setCerts(data.certs);
      if (data.projects) setProjects(data.projects);
      if (data.hackathons) setHackathons(data.hackathons);
    }
  }, [currentUser, isDemo]);

  const savePortfolioToLocal = (newCerts, newProjects, newHackathons) => {
    if (currentUser) {
      localStorage.setItem(`pathnexis_portfolio_${currentUser.uid}`, JSON.stringify({
        certs: newCerts, projects: newProjects, hackathons: newHackathons
      }));
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
    try {
      const query = `
        query getUserProfile($username: String!) {
          matchedUser(username: $username) {
            submitStats {
              acSubmissionNum {
                difficulty
                count
              }
            }
          }
        }
      `;
      const res = await fetch('https://leetcode.com/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, variables: { username: leetcodeUsername } })
      });
      const data = await res.json();
      const allStats = data.data.matchedUser.submitStats.acSubmissionNum;
      const total = allStats.find(s => s.difficulty === 'All')?.count || 0;
      setDsaInput(prev => ({ ...prev, leetcode: total }));
    } catch(err) {
      console.warn("CORS Blocked Leetcode Fetch or invalid user.");
      alert('Unable to fetch from LeetCode due to browser CORS limits. Please enter manually.');
    }
  };

  const handleDsaChange = (e) => {
    setDsaInput({...dsaInput, [e.target.name]: Number(e.target.value)});
  };

  const totalDsa = dsaInput.leetcode + dsaInput.gfg + dsaInput.hackerrank;
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

            <div className="cards-grid dsa-grid">
              <div className="platform-card glass-card">
                <div className="plat-header">
                  <span className="plat-logo leetcode">LC</span>
                  <h4>LeetCode</h4>
                </div>
                <div className="plat-input-group">
                  <div style={{display: 'flex', gap: '5px', marginBottom: '10px'}}>
                    <input type="text" placeholder="Username" className="glass-input" style={{flex: 1}} value={leetcodeUsername} onChange={e => setLeetcodeUsername(e.target.value)} />
                    <button className="btn btn-outline" style={{padding: '0 10px'}} onClick={fetchLeetcodeStats}>Sync</button>
                  </div>
                  <label>Problems Solved</label>
                  <input type="number" name="leetcode" className="glass-input" value={dsaInput.leetcode} onChange={handleDsaChange}/>
                </div>
              </div>
              <div className="platform-card glass-card">
                <div className="plat-header">
                  <span className="plat-logo gfg">GFG</span>
                  <h4>GeeksForGeeks</h4>
                </div>
                <div className="plat-input-group">
                  <label>Problems Solved</label>
                  <input type="number" name="gfg" className="glass-input" value={dsaInput.gfg} onChange={handleDsaChange}/>
                </div>
              </div>
              <div className="platform-card glass-card">
                <div className="plat-header">
                  <span className="plat-logo hr">HR</span>
                  <h4>HackerRank</h4>
                </div>
                <div className="plat-input-group">
                  <label>Problems Solved</label>
                  <input type="number" name="hackerrank" className="glass-input" value={dsaInput.hackerrank} onChange={handleDsaChange}/>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Upload Section - Fixed at bottom */}
      <div className="resume-section glass-card mt-4">
        <h3><FileText size={20} className="mr-2 inline" /> Document Vault - Master Resume</h3>
        <div className="upload-zone">
          <UploadCloud size={48} className="upload-icon" />
          <p>Drag and drop your resume PDF here</p>
          <span className="text-muted text-sm">or</span>
          <button className="btn btn-outline mt-3">Browse Files</button>
        </div>
      </div>

    </div>
  );
};

export default PortfolioTracker;
