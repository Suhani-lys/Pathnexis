import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Building2, GraduationCap, Save, LogOut, Shield, Bell, Palette } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { currentUser, userData, isDemo, logout, updateUserData } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState({
    displayName: userData?.displayName || '',
    collegeName: userData?.collegeName || '',
    branch: userData?.branch || '',
    semester: userData?.semester || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (isDemo || !currentUser) return;
    setSaving(true);
    try {
      updateUserData(profile);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("Save failed:", e);
    }
    setSaving(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/auth');
  };

  return (
    <div className="fade-in" style={{ maxWidth: '700px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 className="page-title">Settings ⚙️</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '5px' }}>Manage your account and preferences.</p>
      </div>

      {/* Profile Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <User size={22} color="#4F8EF7" />
          <h2 style={{ fontSize: '1.3rem' }}>Profile Information</h2>
        </div>

        {/* Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <img 
            src={currentUser?.photoURL || `https://ui-avatars.com/api/?name=${profile.displayName || 'Student'}&background=4F8EF7&color=fff`}
            alt="Avatar" 
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '3px solid #4F8EF7' }}
          />
          <div>
            <p style={{ fontWeight: '600', fontSize: '1.1rem' }}>{profile.displayName || 'Student'}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentUser?.email || 'demo@pathnexis.com'}</p>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <User size={14} style={{ display: 'inline', marginRight: '6px' }} />Full Name
            </label>
            <input 
              type="text" 
              value={profile.displayName} 
              onChange={e => setProfile({...profile, displayName: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <Building2 size={14} style={{ display: 'inline', marginRight: '6px' }} />College
            </label>
            <input 
              type="text" 
              value={profile.collegeName} 
              onChange={e => setProfile({...profile, collegeName: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <GraduationCap size={14} style={{ display: 'inline', marginRight: '6px' }} />Branch
            </label>
            <select
              value={profile.branch}
              onChange={e => setProfile({...profile, branch: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            >
              <option value="">Select Branch</option>
              <option value="CSE">CSE</option>
              <option value="IT">IT</option>
              <option value="ECE">ECE</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', color: '#94a3b8', fontSize: '0.9rem' }}>
              <GraduationCap size={14} style={{ display: 'inline', marginRight: '6px' }} />Semester
            </label>
            <select
              value={profile.semester}
              onChange={e => setProfile({...profile, semester: e.target.value})}
              style={{ width: '100%', padding: '10px 14px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            >
              <option value="">Select</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>{s}th Semester</option>)}
            </select>
          </div>
        </div>

        <button 
          className="btn btn-primary btn-glow" 
          style={{ marginTop: '1.5rem', padding: '12px 28px', display: 'flex', alignItems: 'center', gap: '8px' }}
          onClick={handleSave}
          disabled={saving || isDemo}
        >
          <Save size={18} />
          {saving ? 'Saving...' : saved ? '✅ Saved!' : 'Save Changes'}
        </button>
        {isDemo && <p style={{ color: '#FBBF24', fontSize: '0.85rem', marginTop: '8px' }}>Profile editing is disabled in Demo mode.</p>}
      </div>

      {/* Account Section */}
      <div className="glass-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Shield size={22} color="#4F8EF7" />
          <h2 style={{ fontSize: '1.3rem' }}>Account</h2>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <p style={{ fontWeight: '500' }}>Email</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{currentUser?.email || 'demo@pathnexis.com'}</p>
            </div>
            <Mail size={20} color="#64748b" />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <p style={{ fontWeight: '500' }}>Sign Out</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Log out of your account</p>
            </div>
            <button 
              className="btn btn-outline" 
              onClick={handleLogout}
              style={{ color: '#ef4444', borderColor: 'rgba(239,68,68,0.3)', display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px' }}
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
