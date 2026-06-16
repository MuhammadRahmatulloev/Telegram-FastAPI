import React from 'react';
import useUIStore from '../../store/uiStore';

const IconNav = () => {
  const { activeNav, toggleHamburger, openSettings, openCalls, setActiveNav } = useUIStore();

  return (
    <div style={{
      width: '56px',
      height: '100vh',
      backgroundColor: 'var(--icon-nav-bg)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '12px 0',
      gap: '4px',
    }}>
      {/* Hamburger Menu Icon */}
      <button
        onClick={toggleHamburger}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Chats Icon */}
      <button
        onClick={() => setActiveNav('chats')}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: activeNav === 'chats' ? 'var(--icon-nav-active)' : 'transparent',
          border: 'none',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          if (activeNav !== 'chats') e.target.style.backgroundColor = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          if (activeNav !== 'chats') e.target.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeNav === 'chats' ? 'var(--accent)' : 'white'} strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Calls Icon */}
      <button
        onClick={openCalls}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: activeNav === 'calls' ? 'var(--icon-nav-active)' : 'transparent',
          border: 'none',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          if (activeNav !== 'calls') e.target.style.backgroundColor = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          if (activeNav !== 'calls') e.target.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeNav === 'calls' ? 'var(--accent)' : 'white'} strokeWidth="2">
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
      </button>

      {/* Saved Messages Icon */}
      <button
        onClick={() => setActiveNav('saved')}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: activeNav === 'saved' ? 'var(--icon-nav-active)' : 'transparent',
          border: 'none',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => {
          if (activeNav !== 'saved') e.target.style.backgroundColor = 'var(--hover)';
        }}
        onMouseLeave={(e) => {
          if (activeNav !== 'saved') e.target.style.backgroundColor = 'transparent';
        }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={activeNav === 'saved' ? 'var(--accent)' : 'white'} strokeWidth="2">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {/* Spacer */}
      <div style={{ flex: 1 }} />

      {/* Settings Icon (pinned to bottom) */}
      <button
        onClick={openSettings}
        style={{
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          backgroundColor: 'transparent',
          border: 'none',
          borderRadius: '8px',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      </button>
    </div>
  );
};

export default IconNav;
