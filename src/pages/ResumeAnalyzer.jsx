import React, { useState } from 'react';
import { UploadCloud, FileText, CheckCircle2, AlertCircle, Lightbulb, Download } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
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

const ResumeAnalyzer = () => {
  const { currentUser, isDemo } = useAuth();
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzed, setIsAnalyzed] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [results, setResults] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(10);
    try {
      if (isDemo || !currentUser) {
        setTimeout(() => {
          setResults({
            ats_score: 75,
            key_skills: ['React', 'Node.js', 'Python', 'Git', 'Agile'],
            missing_skills: ['Docker', 'AWS', 'System Design']
          });
          setIsUploading(false);
          setIsAnalyzed(true);
        }, 2000);
        return;
      }

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
      const prompt = `Analyze this resume for placement readiness. Return ONLY a valid JSON object matching the exact structure: {"ats_score": number between 0-100, "key_skills": [array of string], "missing_skills": [array of string], "tips": [array of 3 strings suggesting improvements]}. No extra text or markdown formatting. \n\n Resume Text: ${fullText.substring(0, 3000)}`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD91GvC0Q3jYQAr5YsePaEpj6NKjgnmZg8", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      
      setUploadProgress(100);
      setResults(parsed);
      setIsAnalyzed(true);
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
          <div className="results-header glass-card">
            <div className="ats-overview" style={{flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
              <CircularProgress percentage={results.ats_score} />
              <div className="ats-text text-center mt-4">
                <h2>{results.ats_score > 80 ? "Excellent ATS Score!" : "Needs Polish."}</h2>
                <p>AI has parsed your formatting and keyword density.</p>
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
