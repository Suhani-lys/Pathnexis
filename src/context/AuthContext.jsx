import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { localDB } from '../firebase';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(sessionStorage.getItem('pathnexis-demo') === 'true');

  // Load persisted user session on mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('pathnexis_currentUser');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        setCurrentUser(user);
        // Load user data from localDB
        const data = localDB.getUser(user.uid);
        if (data) {
          setUserData(data);
        }
      }
    } catch (e) {
      console.error('Error restoring session:', e);
    }

    // If demo mode is active, don't wait for auth
    if (isDemo) {
      setLoading(false);
    }

    setLoading(false);
  }, [isDemo]);

  const setDemoMode = (status) => {
    if (status) {
      sessionStorage.setItem('pathnexis-demo', 'true');
    } else {
      sessionStorage.removeItem('pathnexis-demo');
    }
    setIsDemo(status);
  };

  // Called after successful Google Sign-In
  const loginWithGoogle = useCallback((googleUser) => {
    const user = {
      uid: googleUser.sub || googleUser.id,
      displayName: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.picture,
    };

    setCurrentUser(user);
    localStorage.setItem('pathnexis_currentUser', JSON.stringify(user));

    // Check if user exists in localDB, if not create them
    let data = localDB.getUser(user.uid);
    if (!data) {
      data = localDB.setUser(user.uid, {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        createdAt: new Date().toISOString(),
        onboardingComplete: false,
        streakCount: 0,
        tasksCompleted: 0,
        skillsUnlocked: 0,
        readinessScore: 0,
        lastActiveDate: null,
      });
    }

    setUserData(data);
    return data;
  }, []);

  const updateUserData = useCallback((updates) => {
    if (!currentUser) return;
    const updated = localDB.updateUser(currentUser.uid, updates);
    setUserData(updated);
    return updated;
  }, [currentUser]);

  const logout = async () => {
    if (isDemo) {
      setDemoMode(false);
    }
    setCurrentUser(null);
    setUserData(null);
    localStorage.removeItem('pathnexis_currentUser');
    // Revoke Google token if present
    if (window.google?.accounts?.id) {
      window.google.accounts.id.disableAutoSelect();
    }
  };

  const value = {
    currentUser,
    userData,
    loading,
    isDemo,
    setDemoMode,
    loginWithGoogle,
    updateUserData,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
      {loading && (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0A0F1E', color: '#fff' }}>
          <div style={{ border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#4F8EF7', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', marginBottom: '20px' }}></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          <p>Authenticating your session...</p>
        </div>
      )}
    </AuthContext.Provider>
  );
};
