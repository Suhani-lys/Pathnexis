import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Code, Monitor, LineChart, Target, Briefcase } from 'lucide-react';
import './Hero.css';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <section className="hero-section">
      <div className="hero-container">
        {/* Left Column */}
        <div className="hero-text-side">
          <h1 className="hero-title-main">
            Your Career<br />
            Journey, <span className="blue-text">Mapped.</span>
          </h1>
          <p className="hero-subtitle-main">
            Track skills, analyze coding progress, discover growth opportunities, and build a clear roadmap toward your dream career.
          </p>
          <div className="hero-btn-group">
            <button onClick={() => navigate('/auth')} className="btn-get-started-hero">
              Get Started
            </button>
            <button onClick={() => navigate('/auth')} className="btn-explore-hero">
              Explore Your Journey
            </button>
          </div>
        </div>

        {/* Right Column */}
        <div className="hero-graphics-side">
          <div className="graphics-relative-container">
            {/* SVG Background Map */}
            <svg viewBox="0 0 900 550" className="roadmap-graphic-svg" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Background Hills/Mountains */}
              <path d="M 50 500 L 220 320 L 390 500 Z" fill="#F3F4F6" />
              <path d="M 220 500 L 460 220 L 700 500 Z" fill="#E5E7EB" />
              <path d="M 460 500 L 730 60 L 920 500 Z" fill="#D1D5DB" />
              
              {/* Flagpole and Flag on Peak */}
              <line x1="730" y1="60" x2="730" y2="105" stroke="#4B5563" strokeWidth="2.5" />
              <path d="M 730 60 L 775 75 L 730 90 Z" fill="#2563EB" />
              
              {/* Green Pine Trees along hills */}
              {/* Tree 1 */}
              <path d="M 170 370 L 180 355 L 190 370 Z" fill="#10B981" />
              <line x1="180" y1="368" x2="180" y2="375" stroke="#047857" strokeWidth="2" />
              {/* Tree 2 */}
              <path d="M 380 300 L 390 285 L 400 300 Z" fill="#10B981" />
              <line x1="390" y1="298" x2="390" y2="305" stroke="#047857" strokeWidth="2" />
              {/* Tree 3 */}
              <path d="M 620 200 L 630 185 L 640 200 Z" fill="#10B981" />
              <line x1="630" y1="198" x2="630" y2="205" stroke="#047857" strokeWidth="2" />
              
              {/* Winding Blue Road */}
              <path
                d="M 120 480 C 250 500, 420 510, 500 450 C 600 380, 480 370, 460 320 C 430 260, 680 300, 650 230 C 620 170, 580 170, 620 120 C 640 90, 710 100, 730 60"
                stroke="#1E3A8A"
                strokeWidth="14"
                strokeLinecap="round"
              />
              <path
                d="M 120 480 C 250 500, 420 510, 500 450 C 600 380, 480 370, 460 320 C 430 260, 680 300, 650 230 C 620 170, 580 170, 620 120 C 640 90, 710 100, 730 60"
                stroke="#FFFFFF"
                strokeWidth="3.5"
                strokeDasharray="6,6"
                strokeLinecap="round"
              />
            </svg>

            {/* Overlapping HTML Pins */}
            {/* 1. Profile Pin */}
            <div className="roadmap-pin-wrapper pin-profile" style={{ left: '13%', top: '87%' }}>
              <div className="pin-circle pin-blue">
                <User size={16} />
              </div>
              <div className="pin-info-below">
                <span className="pin-title">Profile</span>
                <span className="pin-sub">Build your foundation</span>
              </div>
            </div>

            {/* 2. Skills Pin */}
            <div className="roadmap-pin-wrapper pin-skills" style={{ left: '55%', top: '81%' }}>
              <div className="pin-circle pin-green">
                <Code size={16} />
              </div>
              <div className="pin-info-right">
                <span className="pin-title">Skills</span>
                <span className="pin-sub">Learn and strengthen skills</span>
              </div>
            </div>

            {/* 3. Projects Pin */}
            <div className="roadmap-pin-wrapper pin-projects" style={{ left: '50%', top: '57%' }}>
              <div className="pin-circle pin-purple">
                <Monitor size={16} />
              </div>
              <div className="pin-info-right">
                <span className="pin-title">Projects</span>
                <span className="pin-sub">Build and showcase real-world projects</span>
              </div>
            </div>

            {/* 4. Coding Progress Pin */}
            <div className="roadmap-pin-wrapper pin-coding" style={{ left: '72%', top: '41%' }}>
              <div className="pin-circle pin-orange">
                <LineChart size={16} />
              </div>
              <div className="pin-info-right">
                <span className="pin-title">Coding Progress</span>
                <span className="pin-sub">Track problems, streaks & progress</span>
              </div>
            </div>

            {/* 5. Career Goals Pin */}
            <div className="roadmap-pin-wrapper pin-goals" style={{ left: '69%', top: '21%' }}>
              <div className="pin-circle pin-yellow">
                <Target size={16} />
              </div>
              <div className="pin-info-right">
                <span className="pin-title">Career Goals</span>
                <span className="pin-sub">Define your dream career</span>
              </div>
            </div>

            {/* 6. Opportunities Pin */}
            <div className="roadmap-pin-wrapper pin-opportunities" style={{ left: '81%', top: '10%' }}>
              <div className="pin-circle pin-lightblue">
                <Briefcase size={16} />
              </div>
              <div className="pin-info-right">
                <span className="pin-title">Opportunities</span>
                <span className="pin-sub">Discover internships, jobs & more</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
