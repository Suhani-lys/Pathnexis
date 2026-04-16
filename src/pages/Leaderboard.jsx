import React, { useState, useEffect } from 'react';
import { Filter, User, Trophy, Medal, Star, Flame, Award, Target, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Leaderboard.css';

const mockLeaderboard = [
  { id: 1, rank: 1, name: "Sneha Patel", college: "NIT Trichy", branch: "CSE", score: 95, streak: 42, tasks: 156, badge: "Grandmaster" },
  { id: 2, rank: 2, name: "Rohan Sharma", college: "IIT Bombay", branch: "CSE", score: 92, streak: 38, tasks: 142, badge: "Master" },
  { id: 3, rank: 3, name: "Priya Singh", college: "NIT Surathkal", branch: "IT", score: 89, streak: 25, tasks: 130, badge: "Expert" },
  { id: 4, rank: 4, name: "Alex Johnson", college: "VIT Vellore", branch: "CSE", score: 85, streak: 12, tasks: 115, badge: "Advanced", isUser: true },
  { id: 5, rank: 5, name: "Aman Gupta", college: "BITS Pilani", branch: "ECE", score: 83, streak: 18, tasks: 105, badge: "Advanced" },
  { id: 6, rank: 6, name: "Neha Reddy", college: "SRM Chennai", branch: "CSE", score: 80, streak: 22, tasks: 98, badge: "Intermediate" },
  { id: 7, rank: 7, name: "Vikram Singh", college: "VIT Vellore", branch: "IT", score: 78, streak: 9, tasks: 92, badge: "Intermediate" },
  { id: 8, rank: 8, name: "Simran Kaur", college: "Thapar University", branch: "CSE", score: 75, streak: 14, tasks: 85, badge: "Intermediate" },
  { id: 9, rank: 9, name: "Rahul Verma", college: "DTU Delhi", branch: "SE", score: 72, streak: 5, tasks: 70, badge: "Beginner" },
  { id: 10, rank: 10, name: "Arjun Nair", college: "VIT Vellore", branch: "ECE", score: 68, streak: 3, tasks: 55, badge: "Beginner" },
];

const Leaderboard = () => {
  const { currentUser, userData, isDemo } = useAuth();
  const [filter, setFilter] = useState('all');
  const [displayedData, setDisplayedData] = useState([]);
  const [realLeaderboard, setRealLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);

  useEffect(() => {
    // Use mock data for leaderboard (no backend connected)
    setRealLeaderboard(mockLeaderboard);
  }, [currentUser, isDemo]);

  useEffect(() => {
    setDisplayedData([]);
    let toShow = [...realLeaderboard];
    
    if (filter === 'college' && userData?.collegeName) {
      toShow = toShow.filter(u => u.college === userData.collegeName);
    } else if (filter === 'branch' && userData?.branch && userData?.collegeName) {
      toShow = toShow.filter(u => u.college === userData.collegeName && u.branch === userData.branch);
    }
    
    // Limit to 10 for UI
    toShow = toShow.slice(0, 10);

    const rankedShow = toShow.map((item, index) => ({...item, displayRank: index + 1}));

    setTimeout(() => {
      setDisplayedData(rankedShow);
    }, 100);
  }, [filter, realLeaderboard, userData]);

  // Try to find exact real rank across entire global (Mock if not in top 50, but we use the fetched rank)
  const me = realLeaderboard.find(u => u.isUser) || {
    name: userData?.displayName || "Student",
    college: userData?.collegeName || "Unknown",
    branch: userData?.branch || "Unknown",
    score: Math.round(userData?.readinessScore || 0),
    streak: userData?.streakCount || 0,
    tasks: userData?.tasksCompleted || 0,
    rank: "50+"
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="rank-icon gold" size={20} />;
    if (rank === 2) return <Medal className="rank-icon silver" size={20} />;
    if (rank === 3) return <Award className="rank-icon bronze" size={20} />;
    return <span className="rank-number">#{rank}</span>;
  };

  return (
    <div className="leaderboard-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Campus Rankings 🏆</h1>
        <p className="page-subtitle">Compete with peers and track your campus standing.</p>
      </div>

      {/* User's Current Rank Card */}
      <div className="user-rank-card glass-card">
        <div className="user-rank-header">
          <div className="rank-display">
            <span className="rank-label">Your Rank</span>
            <h2>#{me.rank} <span className="rank-context">globally</span></h2>
          </div>
          <div className="user-profile-badge">
            <User size={24} className="user-icon" />
            <div className="user-info">
              <h3>{me.name}</h3>
              <span>{me.college} • {me.branch}</span>
            </div>
          </div>
        </div>
        
        <div className="user-stats-row">
          <div className="stat-item">
            <Target size={20} className="stat-icon" />
            <div className="stat-details">
              <span className="stat-val">{me.score}%</span>
              <span className="stat-name">Readiness</span>
            </div>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item">
            <Flame size={20} className="stat-icon hot" />
            <div className="stat-details">
              <span className="stat-val">{me.streak} Days</span>
              <span className="stat-name">Streak</span>
            </div>
          </div>
          <div className="stat-separator"></div>
          <div className="stat-item">
            <CheckCircle2 size={20} className="stat-icon auto-width" />
            <div className="stat-details">
              <span className="stat-val">{me.tasks}</span>
              <span className="stat-name">Tasks Done</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Table Section */}
      <div className="leaderboard-container glass-card">
        <div className="leaderboard-header">
          <h3>Global Standings</h3>
          <div className="filter-group">
            <button 
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Colleges
            </button>
            <button 
              className={`filter-btn ${filter === 'college' ? 'active' : ''}`}
              onClick={() => setFilter('college')}
            >
              My College
            </button>
            <button 
              className={`filter-btn ${filter === 'branch' ? 'active' : ''}`}
              onClick={() => setFilter('branch')}
            >
              My Branch
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="leaderboard-table">
            <thead>
              <tr>
                <th>Rank</th>
                <th>Student</th>
                <th>College</th>
                <th>Score</th>
                <th>Streak</th>
                <th>Tasks</th>
                <th>Badge</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((row, index) => (
                <tr 
                  key={row.id} 
                  className={`table-row animate-row ${row.isUser ? 'user-highlight' : ''} ${row.displayRank <= 3 ? `top-${row.displayRank}` : ''}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <td className="rank-cell">
                    {getRankIcon(row.displayRank)}
                  </td>
                  <td className="name-cell">
                    <div className="avatar-small">{row.name.charAt(0)}</div>
                    {row.name}
                  </td>
                  <td className="college-cell">{row.college}</td>
                  <td className="score-cell">{row.score}%</td>
                  <td className="streak-cell">
                    <Flame size={14} className={row.streak > 10 ? 'hot' : 'dim'} /> 
                    {row.streak}
                  </td>
                  <td>{row.tasks}</td>
                  <td>
                    <span className={`badge-tag ${row.badge.toLowerCase()}`}>
                      {row.badge}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {displayedData.length === 0 && (
            <div className="text-center p-8 text-slate-400">Loading standings...</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
