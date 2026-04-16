import React, { useState, useEffect } from 'react';
import { Target, ArrowRight, RefreshCw, CheckCircle, Save } from 'lucide-react';
import './ReadinessCalculator.css';

const questions = [
  { id: 1, text: "How frequently do you practice Data Structures and Algorithms (DSA)?", category: "DSA", options: [{ label: "Daily", score: 10 }, { label: "2-3 times a week", score: 7 }, { label: "Rarely", score: 3 }, { label: "Never", score: 0 }] },
  { id: 2, text: "How many end-to-end projects have you built?", category: "Projects", options: [{ label: "3 or more", score: 10 }, { label: "1-2", score: 6 }, { label: "Course projects only", score: 3 }, { label: "None yet", score: 0 }] },
  { id: 3, text: "Do you have any prior internship experience?", category: "Experience", options: [{ label: "Yes, 2+ internships", score: 10 }, { label: "Yes, 1 internship", score: 7 }, { label: "Freelance/Open Source", score: 5 }, { label: "No experience", score: 0 }] },
  { id: 4, text: "How confident are you with your communication skills?", category: "Soft Skills", options: [{ label: "Very Confident", score: 10 }, { label: "Somewhat Confident", score: 7 }, { label: "Needs Improvement", score: 4 }, { label: "Not Confident", score: 0 }] },
  { id: 5, text: "How many relevant professional certifications do you hold?", category: "Certifications", options: [{ label: "3+ Certifications", score: 10 }, { label: "1-2 Certifications", score: 6 }, { label: "In progress", score: 3 }, { label: "None", score: 0 }] },
  { id: 6, text: "Approximately how many LeetCode/HackerRank problems have you solved?", category: "DSA", options: [{ label: "300+", score: 10 }, { label: "100-300", score: 7 }, { label: "50-100", score: 4 }, { label: "Less than 50", score: 1 }] },
  { id: 7, text: "How well do you understand System Design principles?", category: "Tech Knowledge", options: [{ label: "Can design scalable architectures", score: 10 }, { label: "Know the basics (Load balancers, DBs)", score: 7 }, { label: "Heard of it, never applied", score: 3 }, { label: "What is System Design?", score: 0 }] },
  { id: 8, text: "How would you rate the quality of your current resume?", category: "Preparation", options: [{ label: "ATS-friendly & Reviewed by peers", score: 10 }, { label: "Good, but needs polish", score: 7 }, { label: "Just a basic template", score: 4 }, { label: "Haven't made one yet", score: 0 }] },
  { id: 9, text: "How many mock interviews have you given recently?", category: "Preparation", options: [{ label: "5 or more", score: 10 }, { label: "2-4", score: 7 }, { label: "Just 1", score: 4 }, { label: "None", score: 0 }] },
  { id: 10, text: "How consistent is your study routine?", category: "Consistency", options: [{ label: "Highly structured & consistent", score: 10 }, { label: "Mostly consistent", score: 7 }, { label: "On and off", score: 4 }, { label: "Very irregular", score: 0 }] },
];

const ReadinessCalculator = () => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [isFinished, setIsFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [categoryBreakdown, setCategoryBreakdown] = useState({});

  const progress = ((currentIdx) / questions.length) * 100;

  const handleOptionSelect = (option, category) => {
    const newAnswers = [...answers, { ...option, category }];
    setAnswers(newAnswers);

    if (currentIdx + 1 < questions.length) {
      setCurrentIdx(currentIdx + 1);
    } else {
      calculateResults(newAnswers);
    }
  };

  const calculateResults = (allAnswers) => {
    let totalScore = 0;
    const breakdown = {};

    allAnswers.forEach(ans => {
      totalScore += ans.score;
      if (breakdown[ans.category]) {
        breakdown[ans.category] += ans.score;
      } else {
        breakdown[ans.category] = ans.score;
      }
    });

    setFinalScore(totalScore); // Max is 100 since 10 questions * 10 max points
    setCategoryBreakdown(breakdown);
    setIsFinished(true);
  };

  const resetQuiz = () => {
    setCurrentIdx(0);
    setAnswers([]);
    setIsFinished(false);
    setFinalScore(0);
    setCategoryBreakdown({});
  };

  const getVerdictText = (score) => {
    if (score >= 85) return "You're Interview-Ready for Google & Microsoft! 🎉";
    if (score >= 70) return "You're Interview-Ready for TCS & Infosys, but need 3 weeks for FAANG.";
    if (score >= 50) return "You're on the right track! Focus heavily on DSA and Projects for the next month.";
    return "You're just starting. Let's build a solid 3-month roadmap for you.";
  };

  if (isFinished) {
    const radius = 120;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (finalScore / 100) * circumference;

    return (
      <div className="readiness-page fade-in">
        <h1 className="page-title">Your Placement Readiness 🎯</h1>
        
        <div className="results-container">
          <div className="score-overview glass-card">
            <div className="circular-score-wrapper">
              <svg className="score-ring" width="300" height="300">
                <circle
                  className="ring-bg"
                  strokeWidth="20"
                  r={radius}
                  cx="150"
                  cy="150"
                />
                <circle
                  className={`ring-fill ${finalScore >= 70 ? 'good' : finalScore >= 50 ? 'average' : 'poor'}`}
                  strokeWidth="20"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  r={radius}
                  cx="150"
                  cy="150"
                />
              </svg>
              <div className="score-text">
                <h2>{finalScore}%</h2>
                <span>Readiness</span>
              </div>
            </div>
            
            <div className="verdict-card">
              <h3>Verdict</h3>
              <p>{getVerdictText(finalScore)}</p>
            </div>
          </div>

          <div className="breakdown-card glass-card">
            <h3>Category Breakdown</h3>
            <div className="bar-charts">
              {Object.entries(categoryBreakdown).map(([cat, score]) => {
                // Approximate max score per category (simplification for UI)
                const maxInCat = questions.filter(q => q.category === cat).length * 10;
                const percentFull = (score / maxInCat) * 100;
                
                return (
                  <div key={cat} className="bar-row">
                    <span className="bar-label">{cat}</span>
                    <div className="bar-track">
                      <div 
                        className="bar-fill gradient-fill slide-right" 
                        style={{ width: `${percentFull}%`}} 
                      />
                    </div>
                    <span className="bar-value">{score}/{maxInCat}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="results-actions">
          <button className="btn btn-primary btn-glow">
            <Save size={18} /> Save My Score
          </button>
          <button className="btn btn-outline" onClick={resetQuiz}>
            <RefreshCw size={18} /> Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentIdx];

  return (
    <div className="readiness-page quiz-mode fade-in">
      <h1 className="page-title">Discover Your Placement Readiness 🎯</h1>
      
      <div className="quiz-container glass-card">
        {/* Live Progress Bar */}
        <div className="progress-header">
          <span className="progress-text">Question {currentIdx + 1} of {questions.length}</span>
          <span className="current-percent">{Math.round(progress)}% Completed</span>
        </div>
        <div className="live-progress-track">
          <div className="live-progress-fill pulse" style={{ width: `${progress}%` }}></div>
        </div>

        {/* Question Area */}
        <div className="question-area" key={currentIdx}>
          <h2 className="question-text">{currentQ.text}</h2>
          
          <div className="options-grid">
            {currentQ.options.map((opt, i) => (
              <button 
                key={i} 
                className="option-btn hover-up"
                onClick={() => handleOptionSelect(opt, currentQ.category)}
              >
                <span>{opt.label}</span>
                <ArrowRight className="opt-icon" size={18} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadinessCalculator;
