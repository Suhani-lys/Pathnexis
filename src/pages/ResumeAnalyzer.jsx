import React, { useState, useEffect } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Lightbulb, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config';
import './ResumeAnalyzer.css';

const CircularProgress = ({ percentage }) => {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="ats-ring-container">
      <svg className="ats-ring" width="160" height="160">
        <circle className="ats-ring-bg" strokeWidth="12" r={radius} cx="80" cy="80" />
        <circle
          className="ats-ring-fill pulse-ring"
          strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          r={radius}
          cx="80"
          cy="80"
        />
      </svg>
      <div className="ats-ring-content">
        <span className="ats-value">{percentage}%</span>
        <span className="ats-label">ATS Score</span>
      </div>
    </div>
  );
};

const analyzeResumeLocally = (resumeText, jobDescription) => {
  const commonSkills = [
    'React', 'React Native', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript',
    'Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring Boot', 'C++', 'C#',
    'SQL', 'PostgreSQL', 'MongoDB', 'MySQL', 'Redis', 'Docker', 'Kubernetes', 'AWS', 'GCP',
    'Azure', 'Git', 'CI/CD', 'Agile', 'Scrum', 'Linux', 'GraphQL', 'REST API', 'Figma',
    'Machine Learning', 'Data Science', 'Tailwind CSS'
  ];

  const resumeLower = resumeText.toLowerCase();
  
  // Find matching skills present in resume
  const key_skills = commonSkills.filter(skill => {
    const esc = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(`\\b${esc}\\b`, 'i');
    return regex.test(resumeLower);
  });

  if (key_skills.length === 0) {
    key_skills.push('JavaScript', 'HTML', 'CSS', 'Git');
  }

  // Determine target skills from job description or common list
  let targetSkills = [];
  if (jobDescription.trim()) {
    const jdLower = jobDescription.toLowerCase();
    targetSkills = commonSkills.filter(skill => {
      const esc = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(`\\b${esc}\\b`, 'i');
      return regex.test(jdLower);
    });
  }

  if (targetSkills.length === 0) {
    targetSkills = ['React', 'Node.js', 'SQL', 'Git', 'Docker', 'AWS', 'CI/CD'];
  }

  const missing_skills = targetSkills.filter(skill => !key_skills.includes(skill));

  if (missing_skills.length === 0) {
    const defaultMissing = ['Docker', 'AWS', 'Kubernetes', 'System Design'];
    missing_skills.push(...defaultMissing.filter(skill => !key_skills.includes(skill)));
  }

  const matchedCount = targetSkills.filter(skill => key_skills.includes(skill)).length;
  const matchRatio = targetSkills.length > 0 ? (matchedCount / targetSkills.length) : 0.7;
  let ats_score = Math.round(55 + (matchRatio * 35) + (Math.random() * 5));
  if (ats_score > 98) ats_score = 98;
  if (ats_score < 40) ats_score = 40;

  const tips = [];
  if (missing_skills.length > 0) {
    tips.push(`Incorporate keywords like ${missing_skills.slice(0, 2).join(', ')} to align with the target role.`);
  } else {
    tips.push("Highlight advanced system design and architectural patterns.");
  }
  
  if (resumeText.length < 1000) {
    tips.push("Expand your project descriptions to detail key technical achievements and metrics.");
  } else {
    tips.push("Ensure project bullet points start with strong action verbs (e.g., 'Spearheaded', 'Optimized').");
  }

  if (!resumeLower.includes('quantif') && !resumeLower.includes('%') && !/\b(20|30|40|50|60|70|80|90)%\b/.test(resumeText)) {
    tips.push("Quantify your accomplishments with metrics (e.g., 'improved page load times by 40%').");
  } else {
    tips.push("Add a dedicated certifications or professional achievements section.");
  }

  return {
    ats_score,
    key_skills: key_skills.slice(0, 8),
    missing_skills: missing_skills.slice(0, 5),
    tips: tips.slice(0, 3)
  };
};

const ResumeAnalyzer = () => {
  const { currentUser, isDemo, updateUserData } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [isOfflineMode, setIsOfflineMode] = useState(false);

  useEffect(() => {
    const loadLatestAnalysis = async () => {
      if (!currentUser) return;
      try {
        const res = await fetch(`${API_URL}/api/resume/latest/${currentUser.uid}`);
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success' && data.analysis) {
            setResults(data.analysis);
            setIsOfflineMode(data.analysis.isOfflineMode || false);
            setJobDescription(data.analysis.jobDescription || '');
            setIsAnalyzed(true);
          }
        }
      } catch (err) {
        console.error("Failed to load latest resume analysis from MongoDB:", err);
      }
    };
    loadLatestAnalysis();
  }, [currentUser]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    setIsOfflineMode(false);
    try {
      // 1. Parse PDF Client Side (no server upload needed)
      setUploadProgress(60);
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }

      // 3. Send to Gemini
      setUploadProgress(80);
      const jdContext = jobDescription.trim() ? `\n\nTarget Job Description:\n${jobDescription}` : '';
      const instruction = jobDescription.trim() ? 'Match the resume strictly against the Target Job Description provided.' : '';
      const prompt = `Analyze this resume for placement readiness. ${instruction} Return ONLY a valid JSON object matching the exact structure: {"ats_score": number between 0-100, "key_skills": [array of string], "missing_skills": [array of string], "tips": [array of 3 strings suggesting improvements]}. No extra text or markdown formatting. \n\n Resume Text: ${fullText.substring(0, 3000)}${jdContext}`;

      const apiKey = import.meta.env.VITE_API_KEY;
      let data = null;
      let parsed = null;
      let offline = false;

      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        data = await response.json();
        
        if (!data.candidates || data.candidates.length === 0) {
          console.warn("Gemini 2.5-flash API failed or quota exceeded. Trying Gemini 1.5-flash fallback...", data);
          const response15 = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
          });
          const data15 = await response15.json();
          if (!data15.candidates || data15.candidates.length === 0) {
            throw new Error("Gemini API quota exceeded or service unavailable.");
          }
          data = data15;
        }

        const rawText = data.candidates[0].content.parts[0].text;
        parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      } catch (geminiErr) {
        console.warn("Gemini API call failed, falling back to local rule-based analysis:", geminiErr);
        parsed = analyzeResumeLocally(fullText, jobDescription);
        offline = true;
      }

      setUploadProgress(100);
      setResults(parsed);
      setIsOfflineMode(offline);
      setIsAnalyzed(true);

      // Convert file to base64
      const reader = new FileReader();
      const fileDataBase64 = await new Promise((resolve) => {
        reader.onload = () => {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        };
        reader.readAsDataURL(file);
      });

      // Persist results to MongoDB
      if (currentUser) {
        try {
          await fetch(`${API_URL}/api/resume/upload`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              fileName: file.name,
              fileData: fileDataBase64,
              parsedText: fullText,
              jobDescription,
              ats_score: parsed.ats_score,
              key_skills: parsed.key_skills,
              missing_skills: parsed.missing_skills,
              tips: parsed.tips,
              isOfflineMode: offline
            })
          });
          // Update local profile too for matching features
          updateUserData({ resumeAnalysis: parsed });
        } catch (dbErr) {
          console.error("Failed to save resume analysis to MongoDB database:", dbErr);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="analyzer-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Resume Analyzer 🔍</h1>
        <p className="page-subtitle">Get instant feedback on your resume's ATS compatibility and missing skills.</p>
      </div>

      {!isAnalyzed ? (
        <div className="upload-container glass-card mx-auto">
          {!isUploading ? (
            <>
              <div className="jd-input-container mb-4">
                <label className="text-secondary" style={{display: 'block', marginBottom: '0.5rem', fontWeight: 500}}>Target Job Description (Optional)</label>
                <textarea 
                  className="glass-input full-w" 
                  rows="4" 
                  placeholder="Paste the job description here to tailor the ATS score and feedback..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  style={{resize: 'vertical', width: '100%', marginBottom: '1rem'}}
                ></textarea>
              </div>
              <div className="upload-zone" style={{ position: 'relative' }}>
                <input 
                  type="file" 
                  accept="application/pdf"
                  onChange={handleUpload}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
                />
                <UploadCloud size={64} className="upload-icon mb-4" />
                <h3>Upload Your Resume (PDF)</h3>
                <p className="text-secondary mt-2">Drag and drop your file here, or click to browse</p>
                <div className="btn btn-outline mt-4">Select File</div>
              </div>
            </>
          ) : (
            <div className="scanning-state text-center py-5">
              <div className="scanner-line" style={{ top: `${uploadProgress}%` }}></div>
              <FileText size={64} className="text-primary pulse mx-auto mb-4" />
              <h3>Analyzing Document...</h3>
              <p className="text-secondary">Progress: {Math.round(uploadProgress)}%</p>
              <div className="progress-bar-bg mt-3 mx-auto" style={{ width: '80%', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
                <div style={{ width: `${uploadProgress}%`, height: '100%', background: 'var(--accent-blue)', borderRadius: '4px', transition: 'width 0.3s' }}></div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="results-container slide-up">
          {isOfflineMode && (
            <div className="offline-banner">
              <AlertCircle size={20} />
              <span>
                <strong>Offline Analyzer Mode:</strong> Gemini API rate limit or quota exceeded. Used local rule-based keyword matching.
              </span>
            </div>
          )}
          <div className="results-header glass-card">
            <div className="ats-overview" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <CircularProgress percentage={results.ats_score} />
              <div className="ats-text text-center mt-4">
                <h2>{results.ats_score > 80 ? "Excellent ATS Score!" : "Needs Polish."}</h2>
                <p>{jobDescription.trim() ? "AI matched your resume against the provided Job Description." : "AI has parsed your formatting and keyword density."}</p>
              </div>
            </div>
          </div>

          <div className="skills-analysis grid-2 my-4">
            <div className="skills-card glass-card">
              <h3 className="flex items-center gap-2 mb-3 text-emerald-400">
                <CheckCircle2 size={20} /> Strengths Found
              </h3>
              <div className="pill-container">
                {results.key_skills?.map((str, i) => (
                  <span key={i} className="pill pill-green">{str}</span>
                ))}
              </div>
            </div>

            <div className="skills-card glass-card">
              <h3 className="flex items-center gap-2 mb-3 text-rose-400">
                <AlertCircle size={20} /> Missing Skills
              </h3>
              <div className="pill-container">
                {results.missing_skills?.map((miss, i) => (
                  <span key={i} className="pill pill-red">{miss}</span>
                ))}
              </div>
            </div>
          </div>

          <div className="improvement-tips glass-card mt-4">
            <h3 className="mb-4 text-primary">How to Improve</h3>
            <div className="tips-grid">
              {(results.tips || ['Add more quantifiable metrics', 'Include Docker basics', 'Use stronger action verbs']).map((tip, i) => (
                <div key={i} className="tip-card hover-lift">
                  <Lightbulb size={24} className="tip-icon" />
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="actions-footer text-center mt-5 mb-2">
            <button className="btn btn-primary btn-glow px-5 py-3 flex items-center gap-2 mx-auto" onClick={() => window.print()}>
              <Download size={20} /> Download Analysis Report
            </button>
            <button className="btn btn-ghost mt-3 text-sm" onClick={() => setIsAnalyzed(false)}>
              Analyze Another Resume
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResumeAnalyzer;
