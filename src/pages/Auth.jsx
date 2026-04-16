import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { localDB } from '../firebase';
import { Map, AlertCircle } from 'lucide-react';
import './Auth.css';

const Auth = () => {
  const navigate = useNavigate();
  const { setDemoMode, loginWithGoogle, currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Redirect if already logged in
  useEffect(() => {
    if (currentUser) {
      const data = localDB.getUser(currentUser.uid);
      if (data?.onboardingComplete) {
        navigate('/dashboard');
      } else {
        navigate('/onboarding');
      }
    }
  }, [currentUser, navigate]);

  // Google OAuth login — opens a popup, gets an access token,
  // then fetches user info from Google's userinfo endpoint.
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        setError('');

        // Fetch user profile from Google using the access token
        const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });

        if (!res.ok) {
          throw new Error('Failed to fetch user info from Google.');
        }

        const profile = await res.json();
        // profile contains: sub, name, given_name, family_name, picture, email, email_verified

        const userData = loginWithGoogle(profile);

        if (userData?.onboardingComplete) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      } catch (err) {
        console.error('Google Sign-In Error:', err);
        setError(err.message || 'Sign-in failed. Please try again.');
      } finally {
        setLoading(false);
      }
    },
    onError: (err) => {
      console.error('Google OAuth Error:', err);
      setError('Google sign-in was cancelled or failed. Please try again.');
      setLoading(false);
    },
    flow: 'implicit',
  });

  const handleGoogleSignIn = () => {
    setLoading(true);
    setError('');
    googleLogin();
  };

  const handleDemoMode = () => {
    setDemoMode(true);
    navigate('/dashboard');
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header text-center">
          <Map className="auth-logo mx-auto mb-2" size={48} color="#4F8EF7" />
          <h1 className="auth-title">Welcome to Pathnexis</h1>
          <p className="auth-subtitle">Sign in to continue your placement journey</p>
        </div>

        {error && (
          <div className="auth-error">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}

        <div className="auth-actions">
          <button 
            className="btn btn-google full-width" 
            onClick={handleGoogleSignIn}
            disabled={loading}
            id="google-signin-btn"
          >
            {loading ? (
              <span className="loader-spin"></span>
            ) : (
              <>
                <svg width="20" height="20" viewBox="0 0 48 48">
                  <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                  <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                  <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                  <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                </svg>
                Continue with Google
              </>
            )}
          </button>
          
          <div className="auth-divider">
            <span>or</span>
          </div>

          <button 
            className="btn btn-outline full-width"
            onClick={handleDemoMode}
            disabled={loading}
            id="demo-mode-btn"
          >
            Continue as Demo
          </button>
        </div>

        <div className="auth-footer text-center mt-4">
          <p className="text-sm text-secondary">
            By continuing, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
