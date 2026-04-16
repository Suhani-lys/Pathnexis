import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Onboarding from './pages/Onboarding/Onboarding';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Roadmap from './pages/Roadmap';
import ReadinessCalculator from './pages/ReadinessCalculator';
import ProbabilityPredictor from './pages/ProbabilityPredictor';
import Leaderboard from './pages/Leaderboard';
import DailyTasks from './pages/DailyTasks';
import CompanyIntel from './pages/CompanyIntel';
import PortfolioTracker from './pages/PortfolioTracker';
import ResumeAnalyzer from './pages/ResumeAnalyzer';
import InterviewPrep from './pages/InterviewPrep';
import Settings from './pages/Settings';

const ProtectedRoute = ({ children }) => {
  const { currentUser, isDemo } = useAuth();
  if (!currentUser && !isDemo) {
    return <Navigate to="/auth" replace />;
  }
  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          {/* Authenticated Routes wrapped in Sidebar Layout */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="roadmap" element={<Roadmap />} />
            <Route path="readiness-calculator" element={<ReadinessCalculator />} />
            <Route path="probability-predictor" element={<ProbabilityPredictor />} />
            <Route path="leaderboard" element={<Leaderboard />} />
            <Route path="tasks" element={<DailyTasks />} />
            <Route path="companies" element={<CompanyIntel />} />
            <Route path="portfolio" element={<PortfolioTracker />} />
            <Route path="resume-analyzer" element={<ResumeAnalyzer />} />
            <Route path="interview" element={<InterviewPrep />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </div>
    </Router>
    </AuthProvider>
  );
}

export default App;
