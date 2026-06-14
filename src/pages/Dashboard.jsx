import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
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
  const { userData, currentUser, isDemo, updateUserData } = useAuth();

  const [stats, setStats] = useState({
    readinessScore: 0,
    streakCount: 0,
    tasksCompleted: 0,
    skillsUnlocked: 0,
    roadmapProgress: 0
  });

  const [aiNudge, setAiNudge] = useState("Keep pushing! Complete your daily tasks to reach the next milestone.");
  const [githubAi, setGithubAi] = useState('');
  const [leetcodeAi, setLeetcodeAi] = useState('');
  const [roadmap, setRoadmap] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});

  // Sync stats from userData when it changes
  useEffect(() => {
    if (isDemo) {
      setStats({
        readinessScore: 60,
        streakCount: 12,
        tasksCompleted: 48,
        skillsUnlocked: 9,
        roadmapProgress: 80
      });
    } else if (userData) {
      const skillRatings = userData.skillRatings || {};
      const unlockedCount = Object.values(skillRatings).filter(val => Number(val) >= 7).length;
      setStats(prev => ({
        ...prev,
        readinessScore: userData.readinessScore || 0,
        streakCount: userData.streakCount || 0,
        tasksCompleted: userData.tasksCompleted || prev.tasksCompleted || 0,
        skillsUnlocked: unlockedCount || userData.skillsUnlocked || 0,
        roadmapProgress: userData.roadmapProgress || prev.roadmapProgress || 0
      }));
    }
  }, [userData, isDemo]);

  // Fetch real data (portfolio, roadmap) on mount or user change
  useEffect(() => {
    const fetchRealData = async () => {
      if (!isDemo && currentUser?.uid) {
        try {
          // 1. Fetch portfolio insights
          const portRes = await fetch(`${API_URL}/api/portfolio/${currentUser.uid}`);
          if (portRes.ok) {
            const pData = await portRes.json();
            if (pData.status === 'success' && pData.portfolio) {
              setGithubAi(pData.portfolio.githubAiAnalysis || '');
              setLeetcodeAi(pData.portfolio.leetcodeAiAnalysis || '');
            }
          }

          // 2. Fetch roadmap progress
          const roadmapRes = await fetch(`${API_URL}/api/roadmap/${currentUser.uid}`);
          if (roadmapRes.ok) {
            const rData = await roadmapRes.json();
            if (rData.status === 'success' && rData.roadmap) {
              setRoadmap(rData.roadmap);
              const tasksMap = rData.roadmap.completedTasks || {};
              setCompletedTasks(tasksMap);

              const completedCount = Object.keys(tasksMap).length;
              const progressPct = rData.roadmap.progress || 0;
              setStats(prev => ({
                ...prev,
                tasksCompleted: completedCount,
                roadmapProgress: progressPct
              }));
            }
          }
        } catch (err) {
          console.error("Failed to load real stats/insights in Dashboard:", err);
        }
      } else if (isDemo) {
        setGithubAi('Your GitHub profile shows strong backend proficiency with JavaScript and TypeScript. Consider exploring system architecture patterns to level up.');
        setLeetcodeAi('You have a solid foundation in Easy and Medium problems. Focus on dynamic programming Hard problems next to increase your readiness score.');
      }
    };
    fetchRealData();
  }, [currentUser, isDemo]);

  // Fetch AI Nudge based on readiness score
  useEffect(() => {
    if (isDemo || typeof stats.readinessScore !== 'number') return;
    const fetchNudge = async () => {
      try {
        const prompt = `The user has a placement readiness score of ${Math.round(stats.readinessScore)}. Give exactly ONE short sentence tip on what they should focus on next. No intro, no markdown.`;
        const apiKey = import.meta.env.VITE_API_KEY;
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const d = await res.json();
        if (d.candidates && d.candidates.length > 0) {
          setAiNudge(d.candidates[0].content.parts[0].text);
        } else {
          console.warn("AI Nudge: Invalid response", d);
        }
      } catch (e) {
        console.error("AI Nudge failed", e);
      }
    };
    fetchNudge();
  }, [stats.readinessScore, isDemo]);

  // Handle checking / unchecking roadmap tasks from Dashboard
  const toggleDashboardTask = async (weekNumber, taskIndex) => {
    if (isDemo) {
      // Simulate in demo mode
      const key = `week_${weekNumber}_task_${taskIndex}`;
      const isNowCompleted = !completedTasks[key];
      const updatedTasks = { ...completedTasks, [key]: isNowCompleted };
      if (!isNowCompleted) delete updatedTasks[key];
      
      setCompletedTasks(updatedTasks);
      const totalChecked = Object.keys(updatedTasks).length;
      setStats(prev => ({
        ...prev,
        tasksCompleted: totalChecked,
        roadmapProgress: Math.min(Math.round((totalChecked / 60) * 100), 100)
      }));
      return;
    }

    if (!currentUser) return;

    const key = `week_${weekNumber}_task_${taskIndex}`;
    const isNowCompleted = !completedTasks[key];
    const updatedTasks = { ...completedTasks, [key]: isNowCompleted };
    if (!isNowCompleted) delete updatedTasks[key];
    
    setCompletedTasks(updatedTasks);

    const totalChecked = Object.keys(updatedTasks).length;
    const mapSize = (roadmap?.roadmapData?.length || 12) * 5;
    const pct = Math.min((totalChecked / mapSize) * 100, 100);

    setStats(prev => ({
      ...prev,
      tasksCompleted: totalChecked,
      roadmapProgress: pct
    }));

    try {
      await fetch(`${API_URL}/api/roadmap/${currentUser.uid}/tasks`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          completedTasks: updatedTasks,
          progress: pct
        })
      });

      updateUserData({ roadmapProgress: pct, tasksCompleted: totalChecked });
    } catch (err) {
      console.error("Failed to save tasks progress in Dashboard:", err);
    }
  };

  // Extract active week tasks
  const getActiveWeekTasks = () => {
    if (isDemo) {
      return {
        week_number: 1,
        theme: "Basics & Foundations",
        tasks: [
          'Complete BFS traversal problem',
          'Read System Design basics',
          'Attend mock interview session',
          'Review yesterday notes',
          'Solve 3 arrays problems'
        ]
      };
    }

    if (!roadmap || !roadmap.roadmapData || roadmap.roadmapData.length === 0) {
      return null;
    }

    // Find first week where not all 5 tasks are completed
    let activeWeek = roadmap.roadmapData[0];
    for (const week of roadmap.roadmapData) {
      let weekCompletedCount = 0;
      for (let i = 0; i < 5; i++) {
        if (completedTasks[`week_${week.week_number}_task_${i}`]) {
          weekCompletedCount++;
        }
      }
      if (weekCompletedCount < 5) {
        activeWeek = week;
        break;
      }
    }
    return activeWeek;
  };

  const activeWeek = getActiveWeekTasks();
  const displayName = isDemo ? 'Alex Johnson' : (userData?.displayName || 'Student');
  const firstName = displayName.split(' ')[0] || 'Student';

  // Dream company dynamic display
  const targetCompany = !isDemo && userData?.dreamCompanies && userData.dreamCompanies[0]
    ? userData.dreamCompanies[0]
    : 'Google';
  const targetRoleName = !isDemo && userData?.targetRole
    ? userData.targetRole
    : 'Software Developer';

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Welcome back, {firstName}! 👋</h1>
      
      {/* Top Stats Row */}
      <div className="stats-grid">
        <StatCard 
          title="Readiness Score" 
          value={`${Math.round(stats.readinessScore)}%`} 
          subtitle="Live calculated"
          icon={<span style={{fontSize: '1.2rem'}}>🎯</span>} 
        />
        <StatCard 
          title="Daily Streak" 
          value={`${stats.streakCount} Days`} 
          subtitle="Keep it up!"
          icon={<Flame size={20} color="#FF6B6B" />} 
        />
        <StatCard 
          title="Tasks Completed" 
          value={stats.tasksCompleted} 
          subtitle="roadmap items done"
          icon={<CheckCircle size={20} color="#4ADE80" />} 
        />
        <StatCard 
          title="Skills Unlocked" 
          value={stats.skillsUnlocked} 
          subtitle="Total mastered"
          icon={<Unlock size={20} color="#EC4899" />} 
        />
      </div>

      {/* Center Section: Progress & Nudge */}
      <div className="center-section">
        <div className="progress-container glass-card">
          <CircularProgress percentage={Math.round(stats.readinessScore)} />
        </div>

        <div className="nudge-card glass-card">
          <div className="nudge-content">
            <h3 className="nudge-title">✨ AI Career Insights</h3>
            
            <div className="ai-insights-list" style={{display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px'}}>
              {githubAi && (
                <div className="insight-item" style={{background: 'rgba(236, 72, 153, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #ec4899'}}>
                  <h4 style={{marginBottom: '5px', color: '#ec4899'}}>Developer DNA (GitHub)</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5'}}>{githubAi}</p>
                </div>
              )}
              {leetcodeAi && (
                <div className="insight-item" style={{background: 'rgba(16, 185, 129, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #10b981'}}>
                  <h4 style={{marginBottom: '5px', color: '#10b981'}}>Problem Solving (LeetCode)</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5'}}>{leetcodeAi}</p>
                </div>
              )}
              {!githubAi && !leetcodeAi && (
                <div className="insight-item" style={{background: 'rgba(79, 142, 247, 0.1)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid #4f8ef7'}}>
                  <h4 style={{marginBottom: '5px', color: '#4f8ef7'}}>Daily Nudge</h4>
                  <p style={{fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.5'}}>{aiNudge}</p>
                </div>
              )}
            </div>
          </div>
          
          <button className="btn btn-primary nudge-btn" onClick={() => navigate('/dashboard/portfolio')} style={{marginTop: '20px'}}>
            Sync More Profiles <ArrowRight size={18} style={{marginLeft: '8px'}} />
          </button>
        </div>
      </div>

      {/* Bottom Grid Section */}
      <div className="bottom-grid">
        {/* Active Week Tasks */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Active Week Tasks</h3>
          </div>
          <div className="task-list">
            {activeWeek ? (
              activeWeek.tasks.map((task, i) => {
                const key = `week_${activeWeek.week_number}_task_${i}`;
                const isChecked = !!completedTasks[key];
                return (
                  <label key={i} className="task-item">
                    <input 
                      type="checkbox" 
                      className="custom-checkbox" 
                      checked={isChecked}
                      onChange={() => toggleDashboardTask(activeWeek.week_number, i)}
                    />
                    <span className="task-text" style={{ textDecoration: isChecked ? 'line-through' : 'none', opacity: isChecked ? 0.7 : 1 }}>
                      {task}
                    </span>
                  </label>
                );
              })
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#64748B', padding: '10px 0' }}>
                No active roadmap tasks. Go to the <span style={{ color: '#2563EB', cursor: 'pointer', fontWeight: 600 }} onClick={() => navigate('/dashboard/roadmap')}>Roadmap page</span> to generate one!
              </p>
            )}
          </div>
        </div>

        {/* Dream Company */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Dream Company</h3>
          </div>
          <div className="company-info">
            <div className="company-logo">{targetCompany.charAt(0).toUpperCase()}</div>
            <div className="company-details">
              <h4>{targetCompany}</h4>
              <p>{targetRoleName}</p>
            </div>
          </div>
          <div className="mini-progress-label">Prep Progress ({Math.round(stats.readinessScore)}%)</div>
          <div className="mini-progress-bg">
            <div className="mini-progress-fill" style={{ width: `${Math.round(stats.readinessScore)}%` }}></div>
          </div>
        </div>

        {/* Roadmap Progress */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Roadmap Progress</h3>
          </div>
          <div className="roadmap-current-week">
            <span className="week-badge">Week {activeWeek ? activeWeek.week_number : 'N/A'} Tracking</span>
            <h4>{activeWeek ? activeWeek.theme : 'Overall Progress'}</h4>
            <p>Based on your checked tasks.</p>
          </div>
          <div className="mini-progress-label">Total Completion ({Math.round(stats.roadmapProgress || 0)}%)</div>
          <div className="mini-progress-bg">
            <div className="mini-progress-fill" style={{ width: `${Math.round(stats.roadmapProgress || 0)}%` }}></div>
          </div>
        </div>

        {/* Achievements */}
        <div className="bottom-card glass-card">
          <div className="card-header">
            <h3>Recent Achievements</h3>
          </div>
          <div className="achievements-list">
            <div className="achievement-badge" style={{ opacity: stats.streakCount >= 7 ? 1 : 0.4 }}>
              <span className="badge-icon">🔥</span>
              <span className="badge-name">7 Day Streak</span>
            </div>
            <div className="achievement-badge bronze" style={{ opacity: stats.tasksCompleted >= 10 ? 1 : 0.4 }}>
              <span className="badge-icon">🥉</span>
              <span className="badge-name">Task Rookie</span>
            </div>
            <div className="achievement-badge silver" style={{ opacity: stats.tasksCompleted >= 30 ? 1 : 0.4 }}>
              <span className="badge-icon">🥈</span>
              <span className="badge-name">Roadmap Champ</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

