import React from 'react';
import { Map } from 'lucide-react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container footer-content">
        <div className="footer-brand">
          <div className="logo-section">
            <Map className="logo-icon" size={28} />
            <span className="logo-text gradient-text">Pathnexis</span>
          </div>
          <p className="footer-tagline">Built for students. Designed to place.</p>
        </div>
        
        <div className="footer-links">
          <div className="link-column">
            <h4>Product</h4>
            <a href="#">Features</a>
            <a href="#">Roadmap</a>
            <a href="#">Pricing</a>
          </div>
          <div className="link-column">
            <h4>Company</h4>
            <a href="#">About Us</a>
            <a href="#">Careers</a>
            <a href="#">Contact</a>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Pathnexis. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
