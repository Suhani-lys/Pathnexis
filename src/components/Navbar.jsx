import React, { useEffect, useState } from 'react';
import { Moon, Sun, Map } from 'lucide-react';
import './Navbar.css';

const Navbar = () => {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="navbar glass-card">
      <div className="navbar-container">
        <div className="logo-section">
          <Map className="logo-icon" size={28} />
          <span className="logo-text gradient-text">Pathnexis</span>
        </div>
        
        <div className="nav-actions">
          <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
