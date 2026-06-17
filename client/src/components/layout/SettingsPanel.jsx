import React, { useState, useRef, useEffect } from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import useAuth from '../../hooks/useAuth';

const faqItems = [
  { q: 'What is Telegram?', cat: 'General' },
  { q: 'Who is it for?', cat: 'General' },
  { q: 'How is it different from WhatsApp?', cat: 'General' },
  { q: 'How old is Telegram?', cat: 'General' },
  { q: 'Is it available on my device?', cat: 'General' },
  { q: 'Who are the people behind Telegram?', cat: 'General' },
  { q: 'Where is Telegram based?', cat: 'General' },
  { q: 'How do you make money?', cat: 'General' },
  { q: 'What are your thoughts on internet privacy?', cat: 'General' },
  { q: 'What about GDPR?', cat: 'General' },
  { q: 'Do you process takedown requests?', cat: 'General' },
  { q: 'Do you process data requests?', cat: 'General' },
  { q: 'Who can I message?', cat: 'Telegram Basics' },
  { q: 'Who can message me?', cat: 'Telegram Basics' },
  { q: 'Does Telegram send Verification Codes for other apps?', cat: 'Telegram Basics' },
  { q: 'Who has Telegram?', cat: 'Telegram Basics' },
  { q: 'Inviting friends', cat: 'Telegram Basics' },
  { q: 'What do the check marks mean in Telegram?', cat: 'Telegram Basics' },
];

const SettingsPanel = () => {
  const { isSettingsOpen, closeSettings, isSettingsSearchOpen, openSettingsSearch, closeSettingsSearch, openInfoPanel } = useUIStore();
  const { user } = useAuthStore();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const dropdownRef = useRef(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showDropdown]);

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
        <span style={{ fontSize: '14px', color: 'var(--accent-hover)' }}>
          {right}
        </span>
      )}
    </button>
  );

  const filteredFaq = faqItems.filter((item) =>
    item.q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEditProfile = () => {
    setShowDropdown(false);
    openInfoPanel();
  };

  const handleLogout = () => {
    setShowDropdown(false);
    closeSettings();
    logout();
  };

  if (!isSettingsOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isSettingsOpen ? 'open' : ''}`}
        onClick={() => {
          if (isSettingsSearchOpen) {
            closeSettingsSearch();
            setSearchQuery('');
          } else {
            closeSettings();
          }
        }}
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
          {isSettingsSearchOpen ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
              <button
                onClick={() => {
                  closeSettingsSearch();
                  setSearchQuery('');
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  color: 'white',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5m7-7l-7 7 7 7" />
                </svg>
              </button>
              <input
                type="text"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                style={{
                  flex: 1,
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'white',
                  fontSize: '16px',
                  outline: 'none',
                }}
              />
            </div>
          ) : (
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)' }}>
              Settings
            </h2>
          )}
          {!isSettingsSearchOpen && (
            <div style={{ display: 'flex', gap: '8px', position: 'relative' }}>
              <button
                onClick={openSettingsSearch}
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
              <div ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
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
                {showDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    backgroundColor: '#17212b',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    zIndex: 300,
                    minWidth: '180px',
                    overflow: 'hidden',
                  }}>
                    <button
                      onClick={() => {
                        setShowDropdown(false);
                        showToast('Feature coming soon');
                      }}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>👤</span> Add Account
                    </button>
                    <button
                      onClick={handleEditProfile}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'white',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>✏️</span> Edit Profile
                    </button>
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#e53e3e',
                        fontSize: '14px',
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                    >
                      <span>🚪</span> Log out
                    </button>
                  </div>
                )}
              </div>
              <button
                onClick={() => {
                  if (isSettingsSearchOpen) {
                    closeSettingsSearch();
                    setSearchQuery('');
                  } else {
                    closeSettings();
                  }
                }}
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
          )}
        </div>

        {/* Content */}
        {isSettingsSearchOpen ? (
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredFaq.map((item, i) => (
              <div
                key={i}
                onClick={() => {
                  closeSettingsSearch();
                  setSearchQuery('');
                }}
                style={{
                  padding: '12px 16px',
                  cursor: 'pointer',
                  borderBottom: '1px solid var(--border)',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                <div style={{ fontSize: '15px', color: 'var(--text-primary)', marginBottom: '2px' }}>{item.q}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>FAQ &gt; {item.cat}</div>
              </div>
            ))}
            {filteredFaq.length === 0 && (
              <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                No results found
              </div>
            )}
          </div>
        ) : (
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
                <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>
                  {user?.username}
                </div>
                 <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                   {user?.phone || user?.email}
                 </div>
                <button style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px 0',
                  fontSize: '14px',
                  color: 'var(--accent-hover)',
                }}>
                  Add username
                </button>
              </div>
            </div>

            {user?.phone ? (
              <div style={{
                margin: '16px',
                padding: '16px',
                backgroundColor: 'rgba(43, 82, 120, 0.2)',
                borderRadius: '8px',
              }}>
                <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px' }}>
                  Is {user.phone} still your number?
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
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
                  <button style={{
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
            ) : null}

            {/* Menu Items */}
            <MenuItem icon="👤" text="My Account" onClick={() => { closeSettings(); openInfoPanel(); }} />
            <MenuItem icon="🔔" text="Notifications and Sounds" />
            <MenuItem icon="🔒" text="Privacy and Security" />
            <MenuItem icon="💬" text="Chat Settings" />
            <MenuItem icon="📁" text="Folders" />
            <MenuItem icon="⚙️" text="Advanced" />
            <MenuItem icon="🔊" text="Speakers and Camera" />
            <MenuItem icon="🔋" text="Battery and Animations" />
            <MenuItem icon="🌐" text="Language" right="English" />
            <MenuItem icon="⊙" text="Default interface scale" right="100%" />

            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 16px' }} />

            <MenuItem icon="⭐" text="Telegram Premium" />
            <MenuItem icon="⭐" text="My Stars" />
            <MenuItem icon="💼" text="Telegram Business" />
            <MenuItem icon="🎁" text="Send a Gift" />

            <div style={{ height: '1px', backgroundColor: 'var(--border)', margin: '8px 16px' }} />

            <MenuItem icon="❓" text="Telegram FAQ" />
            <MenuItem icon="✨" text="Telegram Features" />
            <MenuItem icon="💬" text="Ask a Question" />
          </div>
        )}
      </div>

      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#17212b',
          color: 'white',
          padding: '12px 24px',
          borderRadius: '10px',
          fontSize: '14px',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
          transition: 'opacity 0.3s ease',
        }}>
          {toast}
        </div>
      )}
    </>
  );
};

export default SettingsPanel;
