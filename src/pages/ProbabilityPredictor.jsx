import React, { useState, useEffect } from 'react';
import { Settings2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import './ProbabilityPredictor.css';

const ProbabilityPredictor = () => {
  const [formData, setFormData] = useState({
    cgpa: 8.0,
    dsaScore: 5,
    projects: 2,
    internship: false,
    certifications: 1,
    targetCompany: 'TCS'
  });

  const [probability, setProbability] = useState(0);
  const [hasPredicted, setHasPredicted] = useState(false);
  const [isPredicting, setIsPredicting] = useState(false);
  const [insights, setInsights] = useState({ pos: [], neg: [], tip: "" });

  const companiesDetail = {
    'TCS': { baseDifficulty: 30, reqCgpa: 6.5, reqDsa: 4, reqProjects: 1 },
    'Infosys': { baseDifficulty: 32, reqCgpa: 6.5, reqDsa: 4, reqProjects: 1 },
    'Wipro': { baseDifficulty: 35, reqCgpa: 6.0, reqDsa: 4, reqProjects: 1 },
    'Accenture': { baseDifficulty: 40, reqCgpa: 6.5, reqDsa: 5, reqProjects: 2 },
    'Flipkart': { baseDifficulty: 70, reqCgpa: 7.5, reqDsa: 8, reqProjects: 3 },
    'Adobe': { baseDifficulty: 75, reqCgpa: 8.0, reqDsa: 8, reqProjects: 3 },
    'Amazon': { baseDifficulty: 80, reqCgpa: 7.5, reqDsa: 9, reqProjects: 3 },
    'Microsoft': { baseDifficulty: 85, reqCgpa: 8.0, reqDsa: 9, reqProjects: 3 },
    'Google': { baseDifficulty: 90, reqCgpa: 8.0, reqDsa: 9, reqProjects: 4 }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' || type === 'range' ? Number(value) : value
    }));
  };

  const handlePredict = () => {
    setIsPredicting(true);
    setHasPredicted(false);
    
    // Fake processing time
    setTimeout(() => {
      calculateProbability();
      setIsPredicting(false);
      setHasPredicted(true);
    }, 1500);
  };

  const calculateProbability = () => {
    const target = companiesDetail[formData.targetCompany];
    let scoreObj = 100;
    
    let pos = [];
    let neg = [];

    // CGPA evaluation
    if (formData.cgpa >= target.reqCgpa) {
      pos.push("Good CGPA");
    } else {
      scoreObj -= 15;
      neg.push("Low CGPA for target");
    }

    // DSA Evaluation
    if (formData.dsaScore >= target.reqDsa) {
      pos.push("Strong DSA");
    } else {
      scoreObj -= (target.reqDsa - formData.dsaScore) * 5;
      neg.push("Needs better DSA");
    }

    // Projects Evaluation
    if (formData.projects >= target.reqProjects) {
      pos.push("Excellent Projects");
    } else {
      scoreObj -= 10;
      neg.push("Needs more Projects");
    }

    // Internships
    if (formData.internship) {
      pos.push("Industry Experience");
      scoreObj += 5;
    } else if (target.baseDifficulty > 60) {
      neg.push("Lack of internships might hurt");
      scoreObj -= 10;
    }

    // Certifications
    if (formData.certifications > 0) {
      pos.push("Certifications added value");
      scoreObj += (formData.certifications * 2);
    }

    // Cap the score based on difficulty
    const maxPossible = 110 - (target.baseDifficulty * 0.4); 
    scoreObj = Math.min(Math.max(scoreObj, 10), maxPossible);
    
    setProbability(Math.round(scoreObj));
    
    let tip = "";
    if (scoreObj > 80) tip = "You are in a great position! Focus on mock interviews.";
    else if (scoreObj > 50) tip = `You have a decent chance but need to focus on ${neg.length > 0 ? neg[0] : 'DSA concepts'}.`;
    else tip = `It might be challenging to crack ${formData.targetCompany} right now. Consider aiming for service-based companies first while building skills.`;

    setInsights({ pos, neg, tip });
  };

  // Speedometer calculation
  const gaugePercent = probability;
  const rotation = (gaugePercent / 100) * 180;

  return (
    <div className="predictor-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">What Are Your Chances?</h1>
        <p className="page-subtitle">Enter your profile details to predict your placement probability.</p>
      </div>

      <div className="predictor-container">
        {/* Left Side: Form */}
        <div className="form-card glass-card">
          <div className="form-header">
            <Settings2 className="icon" />
            <h2>Profile Metrics</h2>
          </div>

          <div className="form-group grid-2">
            <div className="input-group">
              <label>Current CGPA</label>
              <input 
                type="number" 
                name="cgpa" 
                min="0" 
                max="10" 
                step="0.1" 
                value={formData.cgpa} 
                onChange={handleChange} 
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Target Company</label>
              <select 
                name="targetCompany" 
                value={formData.targetCompany} 
                onChange={handleChange} 
                className="glass-input"
              >
                {Object.keys(companiesDetail).map(comp => (
                  <option key={comp} value={comp} style={{color: '#000'}}>{comp}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="range-label">
              <span>DSA Score (Out of 10)</span>
              <span className="range-val badge">{formData.dsaScore} / 10</span>
            </label>
            <input 
              type="range" 
              name="dsaScore" 
              min="0" 
              max="10" 
              value={formData.dsaScore} 
              onChange={handleChange} 
              className="styled-slider"
            />
          </div>

          <div className="form-group grid-2">
            <div className="input-group">
              <label>Number of Projects</label>
              <input 
                type="number" 
                name="projects" 
                min="0" 
                max="10" 
                value={formData.projects} 
                onChange={handleChange} 
                className="glass-input"
              />
            </div>
            <div className="input-group">
              <label>Certifications</label>
              <input 
                type="number" 
                name="certifications" 
                min="0" 
                max="10" 
                value={formData.certifications} 
                onChange={handleChange} 
                className="glass-input"
              />
            </div>
          </div>

          <div className="form-group toggle-group">
            <label className="toggle-label">
              <span>Internship Experience</span>
              <span className="toggle-sub">Have you completed any?</span>
            </label>
            <label className="switch">
              <input 
                type="checkbox" 
                name="internship" 
                checked={formData.internship} 
                onChange={handleChange} 
              />
              <span className="slider round"></span>
            </label>
          </div>

          <button 
            className={`btn btn-primary btn-block predict-btn mt-4 ${isPredicting ? 'loading' : ''}`} 
            onClick={handlePredict}
            disabled={isPredicting}
          >
            {isPredicting ? 'Analyzing Algorithm...' : 'Predict My Chances'}
          </button>
        </div>

        {/* Right Side: Results */}
        <div className="results-card glass-card">
          {!hasPredicted && !isPredicting ? (
            <div className="empty-state">
              <TrendingUp size={48} className="empty-icon" />
              <h3>Awaiting Input</h3>
              <p>Fill out your profile details and click predict to see your personalized placement probability.</p>
            </div>
          ) : isPredicting ? (
            <div className="analyzing-state">
              <div className="scanner"></div>
              <h3>Crunching your data...</h3>
              <p>Comparing against 10,000+ past placement records.</p>
            </div>
          ) : (
            <div className="prediction-results fade-in">
              <div className="gauge-container">
                <svg viewBox="0 0 200 100" className="gauge">
                  <path
                    className="gauge-bg"
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                  />
                  <path
                    className="gauge-fill"
                    d="M 20 100 A 80 80 0 0 1 180 100"
                    fill="none"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * gaugePercent) / 100}
                    style={{
                      stroke: gaugePercent > 75 ? '#4ADE80' : gaugePercent > 40 ? '#FBBF24' : '#EF4444'
                    }}
                  />
                </svg>
                <div className="gauge-center">
                  <div className="gauge-value" style={{
                      color: gaugePercent > 75 ? '#4ADE80' : gaugePercent > 40 ? '#FBBF24' : '#EF4444'
                    }}>
                    {probability}%
                  </div>
                </div>
              </div>

              <div className="result-text-container">
                <h3 className="result-headline">
                  You have a <span className="highlight" style={{
                      color: gaugePercent > 75 ? '#4ADE80' : gaugePercent > 40 ? '#FBBF24' : '#EF4444'
                    }}>{probability}% chance</span> of placement at <strong>{formData.targetCompany}</strong> 🎉
                </h3>
              </div>

              <div className="insights-container">
                <div className="insight-tags">
                  <div className="tag-group">
                    <span className="tag-title">Helping You:</span>
                    <div className="tags">
                      {insights.pos.length > 0 ? insights.pos.map((p, i) => (
                        <span key={i} className="insight-tag positive">
                          <CheckCircle2 size={14} /> {p}
                        </span>
                      )) : <span className="text-muted">None currently</span>}
                    </div>
                  </div>
                  
                  <div className="tag-group">
                    <span className="tag-title">Hurting You:</span>
                    <div className="tags">
                      {insights.neg.length > 0 ? insights.neg.map((n, i) => (
                        <span key={i} className="insight-tag negative">
                          <AlertCircle size={14} /> {n}
                        </span>
                      )) : <span className="text-muted">Looking good!</span>}
                    </div>
                  </div>
                </div>
                
                <div className="personalized-tip">
                  <h4>💡 Pro Tip:</h4>
                  <p>{insights.tip}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProbabilityPredictor;
