import React, { useEffect, useRef } from 'react';
import { UserPlus, Compass, Trophy } from 'lucide-react';
import './HowItWorks.css';

const steps = [
  {
    icon: <UserPlus size={32} />,
    title: "Create Your Profile",
    description: "Sign up and input your current skills, target role, and graduation year."
  },
  {
    icon: <Compass size={32} />,
    title: "Get Your AI Roadmap",
    description: "Receive a personalized, week-by-week preparation plan tailored to your dream companies."
  },
  {
    icon: <Trophy size={32} />,
    title: "Track & Get Placed",
    description: "Maintain your daily streaks, track interview readiness, and land the job."
  }
];

const HowItWorks = () => {
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
    <section className="how-it-works" ref={sectionRef}>
      <div className="container">
        <div className="section-header scroll-animate">
          <h2 className="section-title gradient-text">How It Works</h2>
          <p className="section-subtitle">Your path to placement sorted in three simple steps.</p>
        </div>

        <div className="steps-container">
          {steps.map((step, index) => (
            <div 
              key={index} 
              className="step-card glass-card scroll-animate" 
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className="step-number">0{index + 1}</div>
              <div className="step-icon">
                {step.icon}
              </div>
              <h3 className="step-title">{step.title}</h3>
              <p className="step-description">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
