import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, CheckCircle, Unlock, ArrowRight, Check } from 'lucide-react';
import './Dashboard.css';

const StatCard = ({ title, value, icon, subtitle }) => (
  <div className="stat-card glass-card">
    <div className="stat-header">
      <h4 className="stat-title">{title}</h4>
      <div className="stat-icon-wrapper">{icon}</div>
    </div>
    <div className="stat-value">{value}</div>
    <div className="stat-subtitle">{subtitle}</div>
  </div>
);

const CircularProgress = ({ percentage }) => {
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="progress-ring-container">
      <svg className="progress-ring" width="220" height="220">
        <circle
          className="progress-ring-circle-bg"
          strokeWidth="15"
          r={radius}
          cx="110"
          cy="110"
        />
        <circle
          className="progress-ring-circle"
          strokeWidth="15"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx="110"
          cy="110"
        />
      </svg>
      <div className="progress-ring-content">
        <span className="ring-value">{percentage}%</span>
        <span className="ring-label">Placement<br/>Readiness</span>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { userData, isDemo } = useAuth();

  // Safe fallback values for demo or before snapshot loads
  const data = isDemo ? {
    displayName: 'Alex Johnson',
    readinessScore: 50,
    streakCount: 12,
    tasksCompleted: 48,
    skillsUnlocked: 9,
    roadmapProgress: 80
  } : userData || {
    displayName: 'Student',
    readinessScore: 0,
    streakCount: 0,
    tasksCompleted: 0,
    skillsUnlocked: 0,
    roadmapProgress: 0
  };

  const firstName = data.displayName?.split(' ')[0] || 'Student';

  const [aiNudge, setAiNudge] = useState("Keep pushing! Complete your daily tasks to reach the next milestone.");

  useEffect(() => {
    if (isDemo || typeof data.readinessScore !== 'number') return;
    const fetchNudge = async () => {
      try {
        const prompt = `The user has a placement readiness score of ${Math.round(data.readinessScore)}. Give exactly ONE short sentence tip on what they should focus on next. No intro, no markdown.`;
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD91GvC0Q3jYQAr5YsePaEpj6NKjgnmZg8", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const d = await res.json();
        setAiNudge(d.candidates[0].content.parts[0].text);
      } catch (e) {
        console.error("AI Nudge failed", e);
      }
    };
    fetchNudge();
  }, [data.readinessScore, isDemo]);

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Welcome back, {firstName}! 👋</h1>
      
      {/* Top Stats Row */}
      <div className="stats-grid">
        <StatCard 
          title="Readiness Score" 
          value={`${Math.round(data.readinessScore)}%`} 
          subtitle="Live calculated"
          icon={<span style={{fontSize: '1.2rem'}}>🎯</span>} 
        />
        <StatCard 
          title="Daily Streak" 
          value={`${data.streakCount} Days`} 
          subtitle="Keep it up!"
          icon={<Flame size={20} color="#FF6B6B" />} 
        />
        <StatCard 
          title="Tasks Completed" 
          value={data.tasksCompleted} 
          subtitle="roadmap items done"
          icon={<CheckCircle size={20} color="#4ADE80" />} 
        />
        <StatCard 
          title="Skills Unlocked" 
          value={data.skillsUnlocked} 
          subtitle="Total mastered"
          icon={<Unlock size={20} color="#FBBF24" />} 
        />
      </div>

      {/* Center Section: Progress & Nudge */}
      <div className="center-section">
        <div className="progress-container glass-card">
          <CircularProgress percentage={Math.round(data.readinessScore)} />
        </div>

        <div className="nudge-card glass-card">
          <div className="nudge-content">
            <h3 className="nudge-title">📈 Next Milestone: 70% Readiness</h3>
            
            <div className="horizontal-progress-container">
              <div className="horizontal-progress-bg">
                <div className="horizontal-progress-fill" style={{ width: '50%' }}></div>
                
                <div className="progress-dot pulse" style={{ left: '50%' }}>
                  <span className="dot-label">You are here</span>
                </div>
                
                <div className="checkpoint" style={{ left: '70%' }}>
                  <span className="checkpoint-label">Next Checkpoint</span>
                </div>
              </div>
            </div>

            <p className="nudge-text text-primary">🤖 {aiNudge}</p>
          </div>
          
          <button className="btn btn-primary nudge-btn" onClick={() => navigate('/dashboard/roadmap')}>
            View My Roadmap <ArrowRight size={18} style={{marginLeft: '8px'}} />
          </button>
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="bottom-grid">
        {/* Today's Tasks */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Today's Tasks</h3>
          </div>
          <div className="task-list">
            {['Complete BFS traversal problem', 'Read System Design basics', 'Attend mock interview session', 'Review yesterday notes'].map((task, i) => (
              <label key={i} className="task-item">
                <input type="checkbox" className="custom-checkbox" />
                <span className="task-text">{task}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Dream Company */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Dream Company</h3>
          </div>
          <div className="company-info">
            <div className="company-logo">G</div>
            <div className="company-details">
              <h4>Google</h4>
              <p>Software Engineer (SDE I)</p>
            </div>
          </div>
          <div className="mini-progress-label">Prep Progress (40%)</div>
          <div className="mini-progress-bg">
            <div className="mini-progress-fill" style={{ width: '40%' }}></div>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Roadmap Progress</h3>
          </div>
          <div className="roadmap-current-week">
            <span className="week-badge">Week Tracking</span>
            <h4>Overall Progress</h4>
            <p>Based on your checked tasks.</p>
          </div>
          <div className="mini-progress-label">Total Completion ({Math.round(data.roadmapProgress || 0)}%)</div>
          <div className="mini-progress-bg">
            <div className="mini-progress-fill" style={{ width: `${Math.round(data.roadmapProgress || 0)}%` }}></div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Recent Achievements</h3>
          </div>
          <div className="achievements-list">
            <div className="achievement-badge">
              <span className="badge-icon">🔥</span>
              <span className="badge-name">7 Day Streak</span>
            </div>
            <div className="achievement-badge bronze">
              <span className="badge-icon">🥉</span>
              <span className="badge-name">Array Master</span>
            </div>
            <div className="achievement-badge silver">
              <span className="badge-icon">🥈</span>
              <span className="badge-name">SQL Basics</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
