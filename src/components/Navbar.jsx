import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-section" style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
          <svg width="32" height="32" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="logo-svg">
            <path d="M12 40L24 24L12 8" stroke="#2563EB" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M36 8L24 24L36 40" stroke="#1E3A8A" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="logo-text">PathNexis</span>
        </div>
        
        <div className="nav-actions">
          <button className="btn-login" onClick={() => navigate('/auth')}>Log In</button>
          <button className="btn-get-started" onClick={() => navigate('/auth')}>Get Started</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
