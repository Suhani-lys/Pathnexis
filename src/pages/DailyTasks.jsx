import React, { useState, useEffect } from 'react';
import { Target, CheckCircle2, Clock, BookOpen, ChevronRight, Flame } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './DailyTasks.css';

const MOCK_TASKS = [
  { id: 1, title: 'Solve 2 Matrix problems on LeetCode', time: '45 mins', difficulty: 'Medium', link: 'https://leetcode.com/tag/matrix/' },
  { id: 2, title: 'Read System Design basics (Load Balancers)', time: '30 mins', difficulty: 'Easy', link: 'https://github.com/donnemartin/system-design-primer' },
  { id: 3, title: 'Complete mock technical interview', time: '60 mins', difficulty: 'Hard', link: 'https://pramp.com' },
  { id: 4, title: 'Revise Object Oriented Programming concepts', time: '40 mins', difficulty: 'Easy', link: 'https://geeksforgeeks.org' },
  { id: 5, title: 'Build one component for portfolio project', time: '90 mins', difficulty: 'Medium', link: 'https://github.com' },
];

const WEEK_DAYS = [
  { name: 'Mon', date: '12', status: 'completed' },
  { name: 'Tue', date: '13', status: 'completed' },
  { name: 'Wed', date: '14', status: 'completed' },
  { name: 'Thu', date: '15', status: 'active' }, 
  { name: 'Fri', date: '16', status: 'pending' },
  { name: 'Sat', date: '17', status: 'pending' },
  { name: 'Sun', date: '18', status: 'pending' },
];

const DailyTasks = () => {
  const { currentUser, userData, isDemo, updateUserData } = useAuth();
  const [completedTasks, setCompletedTasks] = useState([]);
  const [showCelebration, setShowCelebration] = useState(false);

  // Load today's task completion state
  useEffect(() => {
    if (isDemo || !currentUser) return;
    const todayStr = new Date().toISOString().split('T')[0];
    const saved = localStorage.getItem(`pathnexis_tasks_${currentUser.uid}_${todayStr}`);
    if (saved) {
      setCompletedTasks(JSON.parse(saved));
    }
  }, [currentUser, isDemo]);

  const toggleTask = async (taskId) => {
    let newCompleted;
    if (completedTasks.includes(taskId)) {
      newCompleted = completedTasks.filter(id => id !== taskId);
    } else {
      newCompleted = [...completedTasks, taskId];
    }
    
    setCompletedTasks(newCompleted);

    if (!isDemo && currentUser) {
      const todayStr = new Date().toISOString().split('T')[0];
      localStorage.setItem(`pathnexis_tasks_${currentUser.uid}_${todayStr}`, JSON.stringify(newCompleted));

      // Check if all tasks completed today
      if (newCompleted.length === MOCK_TASKS.length && !showCelebration) {
        updateUserData({
          streakCount: (userData?.streakCount || 0) + 1,
          lastActiveDate: new Date().toISOString(),
          tasksCompleted: (userData?.tasksCompleted || 0) + 5
        });
      }
    }

    if (newCompleted.length === MOCK_TASKS.length && !showCelebration) {
      setTimeout(() => setShowCelebration(true), 400); 
    } else {
      setShowCelebration(false);
    }
  };

  const getDifficultyColor = (diff) => {
    switch (diff) {
      case 'Easy': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'Medium': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'Hard': return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default: return 'bg-slate-500/20 text-slate-400';
    }
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="daily-tasks-page fade-in">
      {/* Header Section */}
      <div className="tasks-header">
        <div className="header-left">
          <h1 className="page-title">Today's Mission 🎯</h1>
          <p className="current-date">{today}</p>
        </div>
        <div className="streak-badge glass-card">
          <Flame size={24} className="streak-icon" />
          <div className="streak-text">
            <span className="streak-title">Current Streak</span>
            <span className="streak-val">Day {userData?.streakCount || (isDemo ? 14 : 0)}</span>
          </div>
        </div>
      </div>

      {/* Weekly Strip */}
      <div className="weekly-strip glass-card">
        {WEEK_DAYS.map((day, idx) => (
          <div key={idx} className={`day-card ${day.status}`}>
            <span className="day-name">{day.name}</span>
            <div className="day-circle">
              {day.status === 'completed' ? <CheckCircle2 size={18} /> : day.date}
            </div>
          </div>
        ))}
      </div>

      {/* Tasks Area */}
      {!showCelebration ? (
        <div className="tasks-container">
          <div className="tasks-progress">
            <div className="progress-text">
              <span>Your Progress</span>
              <span>{completedTasks.length} / {MOCK_TASKS.length}</span>
            </div>
            <div className="progress-bar-bg">
              <div 
                className="progress-bar-fill" 
                style={{ width: `${(completedTasks.length / MOCK_TASKS.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="task-list">
            {MOCK_TASKS.map(task => {
              const isChecked = completedTasks.includes(task.id);
              return (
                <div key={task.id} className={`task-card glass-card ${isChecked ? 'completed' : ''}`}>
                  <label className="checkbox-container">
                    <input 
                      type="checkbox" 
                      checked={isChecked}
                      onChange={() => toggleTask(task.id)}
                    />
                    <span className="checkmark"></span>
                  </label>
                  
                  <div className="task-content">
                    <h3 className="task-title">{task.title}</h3>
                    <div className="task-meta">
                      <span className="meta-item">
                        <Clock size={14} /> {task.time}
                      </span>
                      <span className={`meta-pill border ${getDifficultyColor(task.difficulty)}`}>
                        {task.difficulty}
                      </span>
                    </div>
                  </div>

                  <a href={task.link} target="_blank" rel="noopener noreferrer" className="btn btn-outline resource-btn">
                    <BookOpen size={16} /> Resource
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Celebratory State */
        <div className="celebration-card glass-card fade-up">
          <div className="confetti-container">
            <div className="confetti piece-1"></div>
            <div className="confetti piece-2"></div>
            <div className="confetti piece-3"></div>
            <div className="confetti piece-4"></div>
            <div className="confetti piece-5"></div>
            <div className="confetti piece-6"></div>
          </div>
          
          <div className="celeb-content">
            <div className="celeb-icon-wrapper pulse-animation">
              <Target size={64} className="celeb-icon" />
            </div>
            <h2>Day Complete! Streak Updated 🔥</h2>
            <p>You've completed all missions for today. Great dedication!</p>
            
            <button className="btn btn-primary btn-glow mt-4" onClick={() => setShowCelebration(false)}>
              Review Tasks <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DailyTasks;
