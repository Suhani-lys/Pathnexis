import React, { useEffect, useRef } from 'react';
import { Star } from 'lucide-react';
import './Testimonials.css';

const testimonials = [
  {
    name: "Alex Johnson",
    college: "Tech University",
    quote: "Pathnexis completely changed how I prepared for placements. The personalized roadmap kept me focused, and I landed my dream job at a top product company.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Alex+Johnson&background=4F8EF7&color=fff"
  },
  {
    name: "Priya Sharma",
    college: "Engineering Institute",
    quote: "The readiness score is incredibly accurate. It showed me exactly where I was lacking and the interview prep module helped me conquer my anxiety.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Priya+Sharma&background=7C5CBF&color=fff"
  },
  {
    name: "Michael Chen",
    college: "State College",
    quote: "Maintaining the daily streak became an addiction in a good way. The company intel alone is worth its weight in gold. Highly recommended for every student.",
    rating: 5,
    avatar: "https://ui-avatars.com/api/?name=Michael+Chen&background=0A0F1E&color=fff"
  }
];

const Testimonials = () => {
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
    <section className="testimonials-section" ref={sectionRef}>
      <div className="container">
        <div className="section-header scroll-animate">
          <h2 className="section-title gradient-text">What Students Say</h2>
          <p className="section-subtitle">Join thousands of students who have secured their dream placements.</p>
        </div>

        <div className="testimonials-grid">
          {testimonials.map((testimonial, index) => (
            <div 
              key={index} 
              className="testimonial-card glass-card scroll-animate"
              style={{ transitionDelay: `${index * 0.2}s` }}
            >
              <div className="stars">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} size={16} fill="currentColor" className="star-icon" />
                ))}
              </div>
              <p className="quote">"{testimonial.quote}"</p>
              <div className="student-info">
                <img src={testimonial.avatar} alt={testimonial.name} className="avatar" />
                <div>
                  <h4 className="student-name">{testimonial.name}</h4>
                  <p className="student-college">{testimonial.college}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
