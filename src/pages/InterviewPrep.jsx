import React, { useState, useEffect } from 'react';
import { ChevronDown, MessageSquare, Bot, UploadCloud, ChevronUp, PlayCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './InterviewPrep.css';

const PREDEFINED_CATEGORIES = ['DSA', 'OOPs', 'System Design', 'SQL', 'Web Dev', 'HR Questions'];

const InterviewPrep = () => {
  const { isDemo } = useAuth();
  const [selectedSkill, setSelectedSkill] = useState('OOPs');
  const [bankQuestions, setBankQuestions] = useState([]);
  const [loadingBank, setLoadingBank] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({});
  
  const [resumeUploaded, setResumeUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [aiChatMessages, setAiChatMessages] = useState([]);

  // Fetch standard category questions
  useEffect(() => {
    const fetchCategoryQuestions = async () => {
      setLoadingBank(true);
      try {
        if (isDemo) {
          // Demo fallback
          setBankQuestions([
            { question: `What is a core concept of ${selectedSkill}?`, answer_hint: 'Hint: Think deeply about standard definitions.' },
            { question: `Explain a real world use case for ${selectedSkill}.`, answer_hint: 'Hint: Connect it to scale or performance.' }
          ]);
          setLoadingBank(false);
          return;
        }

        const prompt = `Generate exactly 10 common technical interview questions for the category: ${selectedSkill}. Return ONLY a raw JSON array of objects with keys "question" and "answer_hint". No markdown codeblocks.`;
        const res = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD91GvC0Q3jYQAr5YsePaEpj6NKjgnmZg8", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        const text = data.candidates[0].content.parts[0].text;
        const parsed = JSON.parse(text.replace(/```json|```/g, "").trim());
        setBankQuestions(parsed);
      } catch (err) {
        console.error("Failed to fetch questions:", err);
      } finally {
        setLoadingBank(false);
        setOpenAccordions({});
      }
    };
    fetchCategoryQuestions();
  }, [selectedSkill, isDemo]);

  const toggleAccordion = (index) => {
    setOpenAccordions(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    try {
      if (isDemo) {
        setTimeout(() => {
          setAiChatMessages([
            { question: "Explain the project you built using React.", answer_hint: "Focus on state management choices." }
          ]);
          setResumeUploaded(true);
          setIsUploading(false);
        }, 2000);
        return;
      }

      // Parse PDF
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        fullText += textContent.items.map(item => item.str).join(" ") + " ";
      }

      // Gemini fetch
      const prompt = `Based on the following parsed resume text, generate 5 highly specific technical interview questions related to the projects and skills explicitly mentioned in it. Return ONLY a JSON array of objects formatted exactly like this: [{"question": "...", "answer_hint": "..."}]. No markdown code blocks. Resume Text: ${fullText.substring(0, 3000)}`;

      const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=AIzaSyD91GvC0Q3jYQAr5YsePaEpj6NKjgnmZg8", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      const data = await response.json();
      const rawText = data.candidates[0].content.parts[0].text;
      const parsed = JSON.parse(rawText.replace(/```json|```/g, "").trim());
      
      setAiChatMessages(parsed);
      setResumeUploaded(true);
    } catch (err) {
      console.error(err);
      alert("Failed to analyze resume. Please ensure it's a valid text-based PDF.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="interview-page fade-in">
      <div className="page-header text-center">
        <h1 className="page-title">Ace Your Interview 💼</h1>
        <p className="page-subtitle">Master topical questions and practice targeted AI mocks based on your resume.</p>
      </div>

      <div className="prep-grid">
        {/* Left Column: Question Bank */}
        <div className="prep-column glass-card">
          <div className="column-header">
            <h3><PlayCircle className="icon" /> Standard Question Bank</h3>
          </div>
          
          <div className="dropdown-container">
            <select 
              className="glass-input full-width skill-select" 
              value={selectedSkill} 
              onChange={(e) => setSelectedSkill(e.target.value)}
            >
              {PREDEFINED_CATEGORIES.map(skill => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>

          <div className="accordion-list">
            {loadingBank ? (
              <div className="flex-center p-8 text-secondary">
                <Loader2 className="spinner mr-2" /> Generating AI Questions...
              </div>
            ) : bankQuestions.map((item, idx) => (
              <div key={idx} className={`accordion-item glass-card hover-lift ${openAccordions[idx] ? 'open' : ''}`}>
                <div className="accordion-header" onClick={() => toggleAccordion(idx)}>
                  <span className="q-text">{idx + 1}. {item.question}</span>
                  {openAccordions[idx] ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </div>
                {openAccordions[idx] && (
                  <div className="accordion-body fade-in">
                    <p className="a-hint-label">Answer Hint:</p>
                    <p>{item.answer_hint}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Resume Based AI */}
        <div className="prep-column glass-card">
          <div className="column-header">
            <h3><Bot className="icon" /> Resume-Based Questions</h3>
          </div>

          {!resumeUploaded ? (
            <div className="upload-prompt text-center mt-4" style={{ cursor: 'pointer', position: 'relative' }}>
              <input 
                type="file" 
                accept="application/pdf"
                onChange={handleFileUpload} 
                disabled={isUploading}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer' }}
              />
              <UploadCloud size={48} className="upload-icon mx-auto mb-3" />
              <h4>Upload your resume (PDF) to get personalized technical questions.</h4>
              <p className="text-secondary mt-2 mb-4">Our AI will scan your technical stack and project constraints.</p>
              
              <button className={`btn btn-primary btn-glow ${isUploading ? 'loading' : ''}`} disabled={isUploading}>
                {isUploading ? <><Loader2 className="spinner inline mr-1" size={16}/> Analyzing...</> : 'Browse PDF File'}
              </button>
            </div>
          ) : (
            <div className="chat-interface slide-up">
              <div className="chat-notification">
                <span className="noti-dot pulse"></span> AI Analysis Complete
              </div>
              <div className="chat-bubbles">
                {aiChatMessages.map((msg, i) => (
                  <React.Fragment key={i}>
                    <div className="chat-bubble question bot fade-in" style={{animationDelay: `${i*0.2}s`}}>
                      <Bot size={16} className="bubble-icon" />
                      <div className="bubble-text">{msg.question}</div>
                    </div>
                    <div className="chat-bubble hint user fade-in" style={{animationDelay: `${(i*0.2)+0.1}s`}}>
                      <MessageSquare size={16} className="bubble-icon" />
                      <div className="bubble-text"><span className="font-bold">Hint:</span> {msg.answer_hint}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
              <div className="chat-actions mt-4 text-center">
                <button className="btn btn-outline" onClick={() => setResumeUploaded(false)}>Upload Different Resume</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InterviewPrep;
