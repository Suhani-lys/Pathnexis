import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { googleLogout } from '@react-oauth/google';
import { localDB } from '../firebase';

const checkAndCalculateStreak = (profile) => {
  if (!profile) return profile;
  
  const todayStr = new Date().toISOString().split('T')[0];
  if (!profile.lastActiveDate) {
    profile.streakCount = 1;
    profile.lastActiveDate = todayStr;
  } else {
    const lastActiveStr = profile.lastActiveDate.split('T')[0];
    if (lastActiveStr !== todayStr) {
      const lastDate = new Date(lastActiveStr);
      const todayDate = new Date(todayStr);
      const diffTime = Math.abs(todayDate - lastDate);
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        profile.streakCount = (profile.streakCount || 0) + 1;
      } else if (diffDays > 1) {
        profile.streakCount = 1;
      }
      profile.lastActiveDate = todayStr;
    }
  }
  return profile;
};

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
    const restoreSession = async () => {
      try {
        const savedUser = localStorage.getItem('pathnexis_currentUser');
        if (savedUser) {
          const user = JSON.parse(savedUser);
          setCurrentUser(user);
          
          // Load from local storage user profile backup first
          const userKey = `pathnexis_user_${user.uid}`;
          const localProfile = localStorage.getItem(userKey);
          if (localProfile) {
            const parsed = JSON.parse(localProfile);
            const updated = checkAndCalculateStreak(parsed);
            setUserData(updated);
            localStorage.setItem(userKey, JSON.stringify(updated));
          }
          
          setLoading(false);
          
          // Load user data from MongoDB asynchronously without blocking UI mount
          try {
            const res = await fetch(`http://localhost:3000/api/users/${user.uid}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'success') {
                setUserData(data.user);
                localStorage.setItem(userKey, JSON.stringify(data.user));
              }
            }
          } catch (fetchErr) {
            console.warn('MongoDB connection offline, using local session:', fetchErr);
          }
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error('Error restoring session:', e);
        setLoading(false);
      }
    };
    restoreSession();
  }, []);

  const setDemoMode = useCallback(async (status) => {
    if (status) {
      sessionStorage.setItem('pathnexis-demo', 'true');
      const demoUser = {
        uid: 'demo_user',
        displayName: 'Alex Johnson',
        email: 'demo@pathnexis.com',
        photoURL: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=7C3AED&color=fff'
      };
      setCurrentUser(demoUser);
      localStorage.setItem('pathnexis_currentUser', JSON.stringify(demoUser));

      const fallbackDemoProfile = {
        uid: demoUser.uid,
        displayName: demoUser.displayName,
        email: demoUser.email,
        photoURL: demoUser.photoURL,
        onboardingComplete: true,
        streakCount: 12,
        tasksCompleted: 48,
        skillsUnlocked: 9,
        readinessScore: 60,
        targetRole: 'Software Developer',
        dreamCompanies: ['Google']
      };

      try {
        const res = await fetch('http://localhost:3000/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(fallbackDemoProfile)
        });
        if (res.ok) {
          const data = await res.json();
          if (data.status === 'success') {
            setUserData(data.user);
            const userKey = `pathnexis_user_${demoUser.uid}`;
            localStorage.setItem(userKey, JSON.stringify(data.user));
            return;
          }
        }
        setUserData(fallbackDemoProfile);
        const userKey = `pathnexis_user_${demoUser.uid}`;
        localStorage.setItem(userKey, JSON.stringify(fallbackDemoProfile));
      } catch (e) {
        console.warn('Demo remote initialization error, falling back to local demo profile:', e);
        setUserData(fallbackDemoProfile);
        const userKey = `pathnexis_user_${demoUser.uid}`;
        localStorage.setItem(userKey, JSON.stringify(fallbackDemoProfile));
      }
    } else {
      sessionStorage.removeItem('pathnexis-demo');
      setCurrentUser(null);
      setUserData(null);
      localStorage.removeItem('pathnexis_currentUser');
    }
    setIsDemo(status);
  }, []);

  // Called after successful Google Sign-In
  const loginWithGoogle = useCallback(async (googleUser) => {
    const user = {
      uid: googleUser.sub || googleUser.id,
      displayName: googleUser.name,
      email: googleUser.email,
      photoURL: googleUser.picture,
    };

    setCurrentUser(user);
    localStorage.setItem('pathnexis_currentUser', JSON.stringify(user));

    const fallbackUser = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      onboardingComplete: false,
      streakCount: 0,
      tasksCompleted: 0,
      skillsUnlocked: 0,
      readinessScore: 0
    };

    try {
      const res = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
          lastActiveDate: new Date().toISOString()
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setUserData(data.user);
          const userKey = `pathnexis_user_${user.uid}`;
          localStorage.setItem(userKey, JSON.stringify(data.user));
          return data.user;
        }
      }
      setUserData(fallbackUser);
      const userKey = `pathnexis_user_${user.uid}`;
      localStorage.setItem(userKey, JSON.stringify(fallbackUser));
      return fallbackUser;
    } catch (err) {
      console.warn('MongoDB login error, falling back to local user profile:', err);
      setUserData(fallbackUser);
      const userKey = `pathnexis_user_${user.uid}`;
      localStorage.setItem(userKey, JSON.stringify(fallbackUser));
      return fallbackUser;
    }
  }, []);

  const updateUserData = useCallback(async (updates) => {
    if (!currentUser) return;
    
    // Update local state immediately for instant UI feedback
    setUserData(prev => {
      const merged = { ...prev, ...updates };
      const userKey = `pathnexis_user_${currentUser.uid}`;
      localStorage.setItem(userKey, JSON.stringify(merged));
      return merged;
    });

    try {
      const res = await fetch(`http://localhost:3000/api/users/${currentUser.uid}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.status === 'success') {
          setUserData(data.user);
          const userKey = `pathnexis_user_${currentUser.uid}`;
          localStorage.setItem(userKey, JSON.stringify(data.user));
          return data.user;
        }
      }
    } catch (err) {
      console.warn('MongoDB update user error, using local state:', err);
    }
  }, [currentUser]);

  const logout = async () => {
    if (isDemo) {
      await setDemoMode(false);
    } else {
      setCurrentUser(null);
      setUserData(null);
      localStorage.removeItem('pathnexis_currentUser');
    }
    // Revoke Google session
    googleLogout();
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
