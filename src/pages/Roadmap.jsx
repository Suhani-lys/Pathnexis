import React, { useState, useEffect } from 'react';
import { Bot, ChevronDown, Download, CheckCircle, Circle, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { localDB } from '../firebase';
import './Roadmap.css';

const JOB_ROLES = [
  "Software Developer", "Data Scientist", "ML Engineer", 
  "DevOps Engineer", "Cybersecurity Analyst", "Product Manager", 
  "Full Stack Developer"
];

const Roadmap = () => {
  const { currentUser, userData, isDemo, updateUserData } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [roadmapData, setRoadmapData] = useState([]);
  const [completedTasks, setCompletedTasks] = useState({});
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    role: userData?.targetRole || '',
    company: userData?.dreamCompanies?.[0] || '',
    dsaSkill: userData?.skillRatings?.dsa || 5,
    progSkill: userData?.skillRatings?.programming || 5,
    months: 3
  });

  useEffect(() => {
    if (userData?.userRoadmap) {
      setRoadmapData(userData.userRoadmap);
      setHasGenerated(true);
    }
  }, [userData]);

  useEffect(() => {
    if (isDemo || !currentUser) return;
    const saved = localStorage.getItem(`pathnexis_roadmap_progress_${currentUser.uid}`);
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, [currentUser, isDemo]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError('');

    try {
      const prompt = `Generate a personalized 12-week placement preparation roadmap for a student targeting ${formData.role} at ${formData.company} with DSA skill ${formData.dsaSkill}/10 and Programming skill ${formData.progSkill}/10. Return only a valid JSON array of 12 objects with no markdown or extra text. Each object must have: week_number (integer), theme (string), tasks (array of exactly 5 strings), skill_badge (string).`;
      
      const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key="+import.meta.env.VITE_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        }
      );

      const data = await response.json();
      if (!data.candidates) throw new Error("API Limit Reached");
      
      const text = data.candidates[0].content.parts[0].text;
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setRoadmapData(parsed);
      setHasGenerated(true);

      if (!isDemo && currentUser) {
        updateUserData({ userRoadmap: parsed });
      }
    } catch (err) {
      console.error(err);
      setError("⏳ AI is taking a short break — retrying in 30 seconds");
      setTimeout(() => setError(''), 30000);
      // Fallback or handle failure gracefully.
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleTask = async (weekNumber, taskIndex) => {
    const key = `week_${weekNumber}_task_${taskIndex}`;
    const isNowCompleted = !completedTasks[key];
    
    setCompletedTasks(prev => ({
      ...prev,
      [key]: isNowCompleted
    }));

    if (!isDemo && currentUser) {
      const updatedTasks = { ...completedTasks, [key]: isNowCompleted };
      if (!isNowCompleted) delete updatedTasks[key];
      localStorage.setItem(`pathnexis_roadmap_progress_${currentUser.uid}`, JSON.stringify(updatedTasks));

      // Recalculate roadmap progress global percentage
      const totalChecked = Object.keys(updatedTasks).length;
      const mapSize = roadmapData.length * 5;
      const pct = Math.min((totalChecked / mapSize) * 100, 100);
      updateUserData({ roadmapProgress: pct });
    }
  };

  return (
    <div className="roadmap-page">
      <div className="roadmap-header">
        <h1 className="page-title gradient-text">Generate Your AI-Powered Roadmap 🤖</h1>
        <p className="page-subtitle">Customized perfectly to your skills and dream companies.</p>
      </div>

      {error && (
        <div className="glass-card mb-4" style={{padding: '1rem', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '10px'}}>
          <AlertCircle /> {error}
        </div>
      )}

      {!hasGenerated && !isGenerating && (
        <div className="generator-card glass-card">
          <form className="generator-form" onSubmit={handleGenerate}>
            <div className="form-group">
              <label>Target Job Role</label>
              <div className="select-wrapper">
                <select 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})}
                  required
                >
                  <option value="">Select a role</option>
                  {JOB_ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                </select>
                <ChevronDown className="select-icon" size={18} />
              </div>
            </div>

            <div className="form-group">
              <label>Dream Company</label>
              <input 
                type="text" 
                placeholder="e.g. Google, DataDog, Netflix" 
                value={formData.company}
                onChange={e => setFormData({...formData, company: e.target.value})}
                required
              />
            </div>

            <div className="sliders-row">
              <div className="form-group slider-group">
                <div className="slider-label">
                  <span>Current DSA Skill</span>
                  <span className="slider-val">{formData.dsaSkill}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={formData.dsaSkill}
                  onChange={e => setFormData({...formData, dsaSkill: parseInt(e.target.value)})}
                  className="custom-range"
                />
              </div>

              <div className="form-group slider-group">
                <div className="slider-label">
                  <span>Current Programming Skill</span>
                  <span className="slider-val">{formData.progSkill}/10</span>
                </div>
                <input 
                  type="range" min="0" max="10" 
                  value={formData.progSkill}
                  onChange={e => setFormData({...formData, progSkill: parseInt(e.target.value)})}
                  className="custom-range"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Available Preparation Time (Months)</label>
              <div className="select-wrapper">
                <select 
                  value={formData.months} 
                  onChange={e => setFormData({...formData, months: parseInt(e.target.value)})}
                >
                  {[1,2,3,4,5,6].map(m => <option key={m} value={m}>{m} Months</option>)}
                </select>
                <ChevronDown className="select-icon" size={18} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary generate-cta pulse-glow">
              <Bot size={22} style={{marginRight: '8px'}} />
              Generate My Roadmap
            </button>
          </form>
        </div>
      )}

      {isGenerating && (
        <div className="loading-state glass-card pulse-glow">
          <Loader2 className="spinner" size={60} color="var(--accent-blue)" />
          <h2 className="gradient-text">🤖 AI is building your personalized roadmap...</h2>
          <p>The AI is cross-referencing your skills against expected requirements for {formData.company || 'top companies'}...</p>
        </div>
      )}

      {hasGenerated && !isGenerating && (
        <div className="roadmap-results fade-in-up">
          <div className="results-header">
            <div>
              <h2>Your Custom Masterplan</h2>
              <p>Target: {formData.role} at {formData.company}</p>
            </div>
            <button className="btn btn-outline download-btn">
              <Download size={18} />
              Download PDF
            </button>
          </div>

          <div className="timeline-container">
            <div className="timeline-line"></div>
            
            {roadmapData.map((weekData) => {
              const weekNum = weekData.week_number;
              return (
                <div key={weekNum} className="timeline-item">
                  <div className="timeline-dot current"></div>
                  <div className="timeline-card glass-card hover-up">
                    <div className="timeline-card-header">
                      <h3>Week {weekNum}: {weekData.theme}</h3>
                      <span className="skill-badge">{weekData.skill_badge}</span>
                    </div>
                    
                    <ul className="tasks-list">
                      {weekData.tasks.map((task, tidx) => {
                        const isDone = completedTasks[`week_${weekNum}_task_${tidx}`];
                        return (
                          <li key={tidx} className="timeline-task" style={{ cursor: 'pointer' }} onClick={() => toggleTask(weekNum, tidx)}>
                            {isDone ? (
                              <CheckCircle size={18} className="task-icon done" color="#4ADE80" />
                            ) : (
                              <Circle size={18} className="task-icon pending" color="#cbd5e1" />
                            )}
                            <span className={`${isDone ? 'text-done' : ''}`} style={isDone ? { textDecoration: 'line-through', color: '#64748b' } : {}}>{task}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Roadmap;
