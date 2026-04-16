import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ChevronRight } from 'lucide-react';
import './Onboarding.css';

const JOB_ROLES = [
  "Software Developer", "Data Scientist", "ML Engineer", 
  "DevOps Engineer", "Cybersecurity Analyst", "Product Manager", 
  "Full Stack Developer", "Cloud Engineer", "UI/UX Designer", "Business Analyst"
];

const SKILLS = [
  "DSA", "Programming", "Web Development", "SQL & Databases", 
  "System Design", "Communication Skills", "Problem Solving", "Git & Version Control"
];

const Onboarding = () => {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();

  // Form States
  const [personalDetails, setPersonalDetails] = useState({
    fullName: '', collegeName: '', branch: '', semester: '', cgpa: ''
  });
  
  const [careerGoals, setCareerGoals] = useState({
    roles: [], companies: ''
  });

  const [skills, setSkills] = useState(SKILLS.reduce((acc, skill) => ({...acc, [skill]: 5}), {}));
  const { currentUser, isDemo, updateUserData } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      if (!isDemo && currentUser) {
        updateUserData(personalDetails);
      }
      setStep(2);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      if (!isDemo && currentUser) {
        updateUserData({
          selectedRoles: careerGoals.roles,
          dreamCompanies: careerGoals.companies.split(',').map(c => c.trim()).filter(Boolean),
          targetRole: careerGoals.roles[0] || ''
        });
      }
      setStep(3);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      if (!isDemo && currentUser) {
        updateUserData({
          skillRatings: skills,
          onboardingComplete: true
        });
      }
      navigate('/dashboard');
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const progress = (step / 3) * 100;

  const toggleRole = (role) => {
    setCareerGoals(prev => {
      if (prev.roles.includes(role)) {
        return { ...prev, roles: prev.roles.filter(r => r !== role) };
      }
      return { ...prev, roles: [...prev.roles, role] };
    });
  };

  return (
    <div className="onboarding-container">
      {/* Progress Bar */}
      <div className="progress-bar-container">
        <div className="progress-bar" style={{ width: `${progress}%` }}></div>
      </div>

      <div className="onboarding-content">
        <span className="step-indicator gradient-text">Step {step} of 3</span>
        
        {step === 1 && (
          <div className="onboarding-step auth-card glass-card">
            <h2 className="step-title">Tell us about yourself.</h2>
            <div className="form-group">
              <label>Full Name</label>
              <input 
                type="text" 
                placeholder="John Doe" 
                value={personalDetails.fullName}
                onChange={e => setPersonalDetails({...personalDetails, fullName: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>College Name</label>
              <input 
                type="text" 
                placeholder="University of Technology" 
                value={personalDetails.collegeName}
                onChange={e => setPersonalDetails({...personalDetails, collegeName: e.target.value})}
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Branch</label>
                <select 
                  value={personalDetails.branch} 
                  onChange={e => setPersonalDetails({...personalDetails, branch: e.target.value})}
                >
                  <option value="">Select Branch</option>
                  <option value="CSE">CSE</option>
                  <option value="IT">IT</option>
                  <option value="ECE">ECE</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Current Semester</label>
                <select 
                  value={personalDetails.semester} 
                  onChange={e => setPersonalDetails({...personalDetails, semester: e.target.value})}
                >
                  <option value="">Select</option>
                  {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}th Seq</option>)}
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>CGPA (0-10)</label>
              <input 
                type="number" 
                min="0" max="10" step="0.1" 
                placeholder="8.5"
                value={personalDetails.cgpa}
                onChange={e => setPersonalDetails({...personalDetails, cgpa: e.target.value})}
              />
            </div>
            <div className="step-actions">
              <button className="btn btn-primary next-btn" onClick={handleStep1Next} disabled={loading}>
                {loading ? 'Saving...' : <>Next <ChevronRight size={20} /></>}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="onboarding-step auth-card glass-card" style={{ maxWidth: '600px' }}>
            <h2 className="step-title">What's your dream?</h2>
            
            <div className="form-group">
              <label>Select Job Roles</label>
              <div className="pills-container">
                {JOB_ROLES.map(role => (
                  <button 
                    key={role}
                    className={`pill ${careerGoals.roles.includes(role) ? 'active' : ''}`}
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '20px' }}>
              <label>Dream Companies</label>
              <input 
                type="text" 
                placeholder="e.g. Google, Microsoft, Amazon" 
                value={careerGoals.companies}
                onChange={e => setCareerGoals({...careerGoals, companies: e.target.value})}
              />
            </div>

            <div className="step-actions">
              <button className="btn btn-primary next-btn" onClick={handleStep2Next} disabled={loading}>
                {loading ? 'Saving...' : <>Next <ChevronRight size={20} /></>}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="onboarding-step auth-card glass-card" style={{ maxWidth: '600px' }}>
            <h2 className="step-title">Rate your current skills.</h2>
            <p className="step-subtitle">Be honest, this helps us tailor your roadmap.</p>
            
            <div className="sliders-container">
              {SKILLS.map(skill => (
                <div key={skill} className="slider-group">
                  <div className="slider-header">
                    <span>{skill}</span>
                    <span className="slider-value">{skills[skill]}/10</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" max="10" 
                    value={skills[skill]}
                    onChange={(e) => setSkills({...skills, [skill]: parseInt(e.target.value)})}
                    className="skill-slider"
                  />
                </div>
              ))}
            </div>

            <div className="step-actions center">
              <button className="btn btn-primary generate-btn pulse-glow" onClick={handleGenerate} disabled={loading}>
                {loading ? 'Saving Profile...' : 'Generate My Roadmap'}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
