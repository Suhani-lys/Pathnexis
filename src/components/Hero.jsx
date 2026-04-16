import React from 'react';
import { ArrowRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Hero.css';

// Generate star data outside component to avoid impure calls
const generateStarData = () => {
  const stars = [];
  for (let i = 0; i < 150; i++) {
    stars.push({
      left: Math.random() * 100 + '%',
      top: Math.random() * 100 + '%',
      animationDelay: Math.random() * 3 + 's',
      width: Math.random() * 3 + 1 + 'px',
      height: Math.random() * 3 + 1 + 'px',
    });
  }
  return stars;
};

const starData = generateStarData();

// Generate galaxy data
const galaxyData = [
  { size: 300, color: 'rgba(138, 43, 226, 0.3)', top: '10%', left: '20%', animationDelay: Math.random() * 10 + 's' },
  { size: 250, color: 'rgba(75, 0, 130, 0.2)', top: '60%', left: '70%', animationDelay: Math.random() * 10 + 's' },
  { size: 200, color: 'rgba(25, 25, 112, 0.25)', top: '30%', left: '80%', animationDelay: Math.random() * 10 + 's' },
  { size: 350, color: 'rgba(106, 90, 205, 0.2)', top: '70%', left: '10%', animationDelay: Math.random() * 10 + 's' },
];

const Hero = () => {
  const navigate = useNavigate();

  const stars = starData.map((star, i) => (
    <div key={i} className="star" style={star}></div>
  ));

  const galaxies = galaxyData.map((galaxy, index) => (
    <div key={index} className="galaxy" style={{
      width: galaxy.size + 'px',
      height: galaxy.size + 'px',
      background: `radial-gradient(circle, ${galaxy.color} 0%, transparent 70%)`,
      top: galaxy.top,
      left: galaxy.left,
      animationDelay: galaxy.animationDelay,
    }}></div>
  ));

  return (
    <section className="hero">
      <div className="hero-background">
        <div className="gradient-sphere sphere-1"></div>
        <div className="gradient-sphere sphere-2"></div>
        <div className="stars">{stars}</div>
        <div className="galaxies">{galaxies}</div>
      </div>
      
      <div className="hero-content">
        <h1 className="hero-title scroll-animate visible">
          Your Placement Journey,<br />
          <span className="gradient-text">Mapped to Perfection.</span>
        </h1>
        
        <p className="hero-subtitle scroll-animate visible" style={{animationDelay: '0.2s'}}>
          Pathnexis tracks your skills, roadmap, streaks, and readiness — so you walk into placements fully prepared.
        </p>
        
        <div className="hero-cta scroll-animate visible" style={{animationDelay: '0.4s'}}>
          <button onClick={() => navigate('/auth')} className="btn btn-primary" style={{border: 'none'}}>
            Get Started Free <ArrowRight className="btn-icon" size={20} />
          </button>
          <button onClick={() => navigate('/auth')} className="btn btn-outline" style={{padding: '12px 24px'}}>
            Try Demo <Play className="btn-icon" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
