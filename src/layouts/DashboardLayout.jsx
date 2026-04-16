import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  CheckSquare, 
  Building, 
  Briefcase, 
  Mic, 
  Trophy, 
  Settings,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  Target,
  BarChart,
  FileText,
  ChevronUp
} from 'lucide-react';
import './DashboardLayout.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} />, exact: true },
  { path: '/dashboard/roadmap', label: 'My Roadmap', icon: <MapIcon size={20} /> },
  { path: '/dashboard/tasks', label: 'Daily Tasks', icon: <CheckSquare size={20} /> },
  { path: '/dashboard/companies', label: 'Company Intel', icon: <Building size={20} /> },
  { path: '/dashboard/readiness-calculator', label: 'Readiness Quiz', icon: <Target size={20} /> },
  { path: '/dashboard/probability-predictor', label: 'Chances Predictor', icon: <BarChart size={20} /> },
  { path: '/dashboard/portfolio', label: 'Portfolio', icon: <Briefcase size={20} /> },
  { path: '/dashboard/interview', label: 'Interview Prep', icon: <Mic size={20} /> },
  { path: '/dashboard/resume-analyzer', label: 'Resume Analyzer', icon: <FileText size={20} /> },
  { path: '/dashboard/leaderboard', label: 'Leaderboard', icon: <Trophy size={20} /> },
  { path: '/dashboard/settings', label: 'Settings', icon: <Settings size={20} /> },
];

const DashboardLayout = () => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('pathnexis-theme') || 'dark';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { userData, currentUser, isDemo, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  const displayName = isDemo ? "Alex Johnson" : (userData?.displayName || currentUser?.displayName || "Student");
  const photoURL = isDemo ? "https://ui-avatars.com/api/?name=Alex+Johnson&background=4F8EF7&color=fff" : (userData?.photoURL || currentUser?.photoURL || `https://ui-avatars.com/api/?name=${displayName.replace(' ', '+')}&background=4F8EF7&color=fff`);

  const [notifications, setNotifications] = useState([
    { id: 1, text: "⚠️ You haven't practiced DSA in 2 days — your streak is at risk!", accent: "red", time: "2 hours ago" },
    { id: 2, text: "🏢 Google opens campus hiring in 3 weeks — start prep now!", accent: "blue", time: "5 hours ago" },
    { id: 3, text: "✅ You're 80% done with Week 3 roadmap — keep going!", accent: "green", time: "1 day ago" },
    { id: 4, text: "🏆 You moved up to Rank #3 on the campus leaderboard!", accent: "gold", time: "2 days ago" },
    { id: 5, text: "📄 Your resume ATS score can improve by adding Docker skills.", accent: "purple", time: "2 days ago" }
  ]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('pathnexis-theme', theme);
  }, [theme]);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const dismissNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}

      {/* Sidebar Navigation */}
      <aside className={`sidebar glass-card ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <MapIcon className="logo-icon" size={28} />
          <span className="logo-text gradient-text">Pathnexis</span>
          <button className="mobile-close" onClick={() => setSidebarOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              end={item.exact}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-area">
        {/* Top Navbar */}
        <header className="dashboard-header glass-card">
          <div className="header-left">
            <button className="mobile-toggle" onClick={() => setSidebarOpen(true)}>
              <Menu size={24} />
            </button>
            <h2 className="current-page-title">Workspace</h2>
          </div>

          <div className="header-right">
            <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className="notification-wrapper">
              <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                <Bell size={20} />
                {notifications.length > 0 && <span className="notification-dot"></span>}
              </button>
              
              {showNotifications && (
                <div className="notification-panel glass-card slide-down">
                  <div className="noti-header">
                    <h3>Notifications</h3>
                    <button className="text-secondary" onClick={() => setNotifications([])}>Clear all</button>
                  </div>
                  <div className="noti-list">
                    {notifications.length === 0 ? (
                      <div className="empty-noti">You're all caught up!</div>
                    ) : (
                      notifications.map(noti => (
                        <div key={noti.id} className={`noti-card accent-${noti.accent}`}>
                          <div className="noti-content">
                            <p>{noti.text}</p>
                            <span className="noti-time">{noti.time}</span>
                          </div>
                          <button className="noti-dismiss" onClick={() => dismissNotification(noti.id)}>
                            <X size={14} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            <div className="user-profile-wrapper" style={{ position: 'relative' }}>
              <div className="user-profile" onClick={() => setShowProfileMenu(!showProfileMenu)}>
                <span className="user-name">{displayName}</span>
                <img src={photoURL} alt="User" className="avatar-img" />
              </div>
              
              {showProfileMenu && (
                <div className="profile-dropdown glass-card slide-down" style={{ position: 'absolute', top: '120%', right: 0, padding: '0.5rem', minWidth: '150px', zIndex: 1000, display: 'flex', flexDirection: 'column', gap: '0.5rem', borderRadius: '8px' }}>
                  <button className="btn btn-ghost" style={{ textAlign: 'left', width: '100%', padding: '0.5rem' }} onClick={() => { setShowProfileMenu(false); navigate('/dashboard/settings'); }}>Settings</button>
                  <button className="btn btn-ghost" style={{ textAlign: 'left', width: '100%', padding: '0.5rem', color: '#ef4444' }} onClick={handleLogout}>Sign Out</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>
      </div>

      {showBackToTop && (
        <button className="back-to-top btn-glow fade-in" onClick={scrollToTop}>
          <ChevronUp size={24} />
        </button>
      )}
    </div>
  );
};

export default DashboardLayout;
