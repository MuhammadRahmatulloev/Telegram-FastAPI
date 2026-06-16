import React from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const ProfileModal = () => {
  const { isProfileOpen, closeProfile } = useUIStore();
  const { user } = useAuthStore();

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!isProfileOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isProfileOpen ? 'open' : ''}`}
        onClick={closeProfile}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`hamburger-panel ${isProfileOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: isProfileOpen ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: isProfileOpen ? 1 : 0,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          width: '400px',
          maxWidth: '90vw',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <button
            onClick={closeProfile}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            fontWeight: '600',
            color: 'white',
            marginBottom: '16px',
          }}>
            {getInitials(user?.username)}
          </div>

          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            {user?.username}
          </h2>

          <div style={{
            fontSize: '14px',
            color: 'var(--success)',
            marginBottom: '16px',
          }}>
            online
          </div>

          <div style={{
            fontSize: '16px',
            color: 'var(--text-primary)',
            marginBottom: '4px',
          }}>
            +992 11 717 2223
          </div>

          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '32px',
          }}>
            Mobile
          </div>

          <div style={{
            fontSize: '14px',
            color: 'var(--text-secondary)',
          }}>
            Your stories will be here.
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfileModal;
