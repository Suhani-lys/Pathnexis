import React, { useEffect, useRef } from 'react';
import { Map, BarChart, Building, Mic, Briefcase, Flame } from 'lucide-react';
import './Features.css';

const features = [
  {
    icon: <Map className="feature-icon" size={24} />,
    title: "Personalized Roadmap",
    description: "AI-generated week-by-week plan based on your current skills and target companies."
  },
  {
    icon: <BarChart className="feature-icon" size={24} />,
    title: "Readiness Score",
    description: "Real-time metrics showing exactly how prepared you are for upcoming placements."
  },
  {
    icon: <Building className="feature-icon" size={24} />,
    title: "Company Intel",
    description: "Deep dive insights into interview structures and frequently asked questions for top tech giants."
  },
  {
    icon: <Mic className="feature-icon" size={24} />,
    title: "Interview Prep",
    description: "Practice mock interviews with AI and get instant feedback on your communication."
  },
  {
    icon: <Briefcase className="feature-icon" size={24} />,
    title: "Portfolio Tracker",
    description: "Keep all your projects, certifications, and achievements in one easily trackable dashboard."
  },
  {
    icon: <Flame className="feature-icon" size={24} />,
    title: "Daily Streak System",
    description: "Build consistency with gamified streaks that keep you motivated to code every single day."
  }
];

const Features = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    const elements = sectionRef.current.querySelectorAll('.scroll-animate');
    elements.forEach(el => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="features-section" ref={sectionRef}>
      <div className="container">
        <div className="section-header scroll-animate">
          <h2 className="section-title gradient-text">Everything You Need</h2>
          <p className="section-subtitle">Powerful tools designed specifically for college students.</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="feature-card glass-card scroll-animate"
              style={{ transitionDelay: `${index * 0.1}s` }}
            >
              <div className="icon-wrapper">
                {feature.icon}
              </div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
