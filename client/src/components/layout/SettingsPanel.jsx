import React from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const SettingsPanel = () => {
  const { isSettingsOpen, closeSettings } = useUIStore();
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

  const MenuItem = ({ icon, text, right, onClick }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        height: '48px',
        padding: '0 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <span style={{ fontSize: '20px', color: 'var(--text-secondary)' }}>{icon}</span>
      <span style={{ fontSize: '15px', color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>{text}</span>
      {right && (
        <span style={{
          fontSize: '14px',
          color: 'var(--accent-hover)',
        }}>
          {right}
        </span>
      )}
    </button>
  );

  if (!isSettingsOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isSettingsOpen ? 'open' : ''}`}
        onClick={closeSettings}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`hamburger-panel ${isSettingsOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: isSettingsOpen ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: isSettingsOpen ? 1 : 0,
          transition: 'transform 0.2s ease, opacity 0.2s ease',
          width: '500px',
          maxWidth: '90vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '16px',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Settings
          </h2>
          <div style={{ display: 'flex', gap: '8px' }}>
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
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
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
                <circle cx="12" cy="12" r="1" />
                <circle cx="12" cy="5" r="1" />
                <circle cx="12" cy="19" r="1" />
              </svg>
            </button>
            <button
              onClick={closeSettings}
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
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {/* Profile Section */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              fontWeight: '600',
              color: 'white',
            }}>
              {getInitials(user?.username)}
            </div>
            <div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text-primary)',
              }}>
                {user?.username}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)',
              }}>
                +992 11 717 2223
              </div>
              <button
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: '14px',
                  color: 'var(--accent-hover)',
                }}
              >
                Add username
              </button>
            </div>
          </div>

          {/* Phone Verification Box */}
          <div style={{
            margin: '16px',
            padding: '16px',
            backgroundColor: 'rgba(43, 82, 120, 0.2)',
            borderRadius: '8px',
          }}>
            <div style={{
              fontSize: '14px',
              color: 'var(--text-primary)',
              marginBottom: '12px',
            }}>
              Is +992 11 717 2223 still your number?
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
              >
                Yes
              </button>
              <button
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
              >
                No
              </button>
            </div>
          </div>

          {/* Menu Items */}
          <MenuItem icon="👤" text="My Account" />
          <MenuItem icon="🔔" text="Notifications and Sounds" />
          <MenuItem icon="🔒" text="Privacy and Security" />
          <MenuItem icon="💬" text="Chat Settings" />
          <MenuItem icon="📁" text="Folders" />
          <MenuItem icon="⚙️" text="Advanced" />
          <MenuItem icon="🔊" text="Speakers and Camera" />
          <MenuItem icon="🔋" text="Battery and Animations" />
          <MenuItem icon="🌐" text="Language" right="English" />
          <MenuItem icon="⊙" text="Default interface scale" right="100%" />

          <div style={{
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '8px 16px',
          }} />

          <MenuItem icon="⭐" text="Telegram Premium" />
          <MenuItem icon="⭐" text="My Stars" />
          <MenuItem icon="💼" text="Telegram Business" />
          <MenuItem icon="🎁" text="Send a Gift" />

          <div style={{
            height: '1px',
            backgroundColor: 'var(--border)',
            margin: '8px 16px',
          }} />

          <MenuItem icon="❓" text="Telegram FAQ" />
          <MenuItem icon="✨" text="Telegram Features" />
          <MenuItem icon="💬" text="Ask a Question" />
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
