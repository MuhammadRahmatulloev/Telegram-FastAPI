import React from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';

const HamburgerMenu = () => {
  const { isHamburgerOpen, closeHamburger, openProfile, openSettings, openNewGroupModal, openNewChannelModal, openContacts } = useUIStore();
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

  const MenuItem = ({ icon, text, badge, onClick }) => (
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
      {badge && (
        <span style={{
          fontSize: '11px',
          color: 'var(--accent-hover)',
          fontWeight: '600',
        }}>
          {badge}
        </span>
      )}
    </button>
  );

  if (!isHamburgerOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isHamburgerOpen ? 'open' : ''}`}
        onClick={closeHamburger}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`hamburger-panel ${isHamburgerOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          width: '260px',
          height: '100vh',
          backgroundColor: 'var(--hamburger-bg)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Panel Header */}
        <div style={{
          padding: '16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '600',
            color: 'white',
          }}>
            {getInitials(user?.username)}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
            }}>
              {user?.username}
            </div>
            <div style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
            }}>
              {user?.email}
            </div>
          </div>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </div>

        {/* Menu Items */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <MenuItem icon="👤" text="My Profile" onClick={() => { closeHamburger(); openProfile(); }} />
          <MenuItem icon="💎" text="Telegram Premium" badge="NEW" onClick={() => {}} />
          <MenuItem icon="👥" text="New Group" onClick={() => { closeHamburger(); openNewGroupModal(); }} />
          <MenuItem icon="📢" text="New Channel" onClick={() => { closeHamburger(); openNewChannelModal(); }} />
          <MenuItem icon="👤" text="Contacts" onClick={() => { closeHamburger(); openContacts(); }} />
          <MenuItem icon="📞" text="Calls" onClick={() => { closeHamburger(); }} />
          <MenuItem icon="💾" text="Saved Messages" onClick={() => {}} />
          <MenuItem icon="⚙️" text="Settings" onClick={() => { closeHamburger(); openSettings(); }} />
          <MenuItem icon="🌙" text="Night Mode" badge="ON" onClick={() => {}} />
        </div>

        {/* Panel Footer */}
        <div style={{
          padding: '16px',
          borderTop: '1px solid var(--border)',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '12px',
            color: 'var(--text-secondary)',
            marginBottom: '4px',
          }}>
            Telegram Desktop
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
          }}>
            Version 1.0.0
          </div>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
