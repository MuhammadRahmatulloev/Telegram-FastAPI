import React, { useState, useRef, useEffect, useCallback } from 'react';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import * as usersApi from '../../api/usersApi';

const COLORS_1 = ['#e17076', '#f4a537', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae', '#c0c0c0'];
const COLORS_2 = ['#ff8a80', '#ffd180', '#b39ddb', '#a5d6a7', '#80cbc4', '#90caf9', '#f48fb1', '#e0e0e0'];
const NAME_COLORS = ['#e17076', '#f4a537', '#a695e7', '#7bc862', '#6ec9cb', '#65aadd', '#ee7aae', '#c0c0c0',
  '#ff8a80', '#ffd180', '#b39ddb', '#a5d6a7', '#80cbc4', '#90caf9', '#f48fb1', '#e0e0e0',
  '#ff6b6b', '#ffb347', '#9b59b6', '#2ecc71', '#1abc9c', '#3498db', '#e91e63', '#95a5a6',
  '#ff4757', '#ffa502', '#3742fa', '#2ed573', '#7bed9f', '#70a1ff', '#ff6b81', '#ced6e0',
  '#fc5c65', '#fd9644', '#a55eea', '#26de81', '#45aaf2', '#4b7bec', '#fc5c65', '#d1d8e0',
  '#eb3b5a', '#f7b731', '#8854d0', '#20bf6b', '#0fb9b1', '#2d98da', '#e17055', '#a4b0be',
  '#e66767', '#f19066', '#574b90', '#78e08f', '#3dc1d3', '#3b9ae1', '#e15f41', '#81ecec',
  '#d63031', '#e17055', '#6c5ce7', '#00b894', '#00cec9', '#0984e3', '#fd79a8', '#dfe6e9'];

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const InfoPanel = () => {
  const { isInfoPanelOpen, closeInfoPanel, openSettings, openNewChannelModal } = useUIStore();
  const { user } = useAuthStore();

  const [activeView, setActiveView] = useState('info');
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [showPersonalChannelModal, setShowPersonalChannelModal] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);
  const [showPhonePopup, setShowPhonePopup] = useState(false);
  const [bio, setBio] = useState(user?.bio || '');
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState(user?.username || '');
  const [usernameInput, setUsernameInput] = useState('');
  const [selectedColor, setSelectedColor] = useState(user?.name_color || '#2b5278');
  const [colorPickerTab, setColorPickerTab] = useState('profile');
  const [colorPickerIcons, setColorPickerIcons] = useState(false);
  const [nameIcons, setNameIcons] = useState(false);
  const [birthdayDay, setBirthdayDay] = useState(26);
  const [birthdayMonth, setBirthdayMonth] = useState(8);
  const [birthdayYear, setBirthdayYear] = useState(2004);
  const [nameError, setNameError] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isInfoPanelOpen && user?.birthday) {
      const parts = user.birthday.split('-');
      if (parts.length === 3) {
        setBirthdayYear(parseInt(parts[0]));
        setBirthdayMonth(parseInt(parts[1]));
        setBirthdayDay(parseInt(parts[2]));
      }
    }
    if (isInfoPanelOpen && user) {
      setBio(user.bio || '');
      setEditNameValue(user.username || '');
      setSelectedColor(user.name_color || '#2b5278');
    }
  }, [isInfoPanelOpen, user]);

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const formatBirthday = (day, month, year) => {
    if (!day || !month || !year) return '';
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    try {
      const updatedUser = await usersApi.uploadAvatar(formData);
      useAuthStore.setState({ user: updatedUser });
    } catch (err) {
      console.error('Avatar upload failed', err);
    }
  };

  const handleBioBlur = async () => {
    try {
      const updatedUser = await usersApi.updateCurrentUser({ bio });
      useAuthStore.setState({ user: updatedUser });
    } catch (err) {
      console.error('Bio update failed', err);
    }
  };

  const handleNameSave = async () => {
    const val = editNameValue.trim();
    if (val.length < 3) {
      setNameError('Minimum 3 characters');
      return;
    }
    if (val.includes(' ')) {
      setNameError('No spaces allowed');
      return;
    }
    try {
      const updatedUser = await usersApi.updateCurrentUser({ username: val });
      useAuthStore.setState({ user: updatedUser });
      setEditingName(false);
      setNameError('');
    } catch (err) {
      setNameError(err.response?.data?.detail || 'Failed to update');
    }
  };

  const handleUsernameSave = async () => {
    let val = usernameInput.trim();
    val = val.replace(/^@+/, '');
    if (val.length < 5) {
      return;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) {
      return;
    }
    try {
      const updatedUser = await usersApi.updateCurrentUser({ username: val });
      useAuthStore.setState({ user: updatedUser });
      setShowUsernameModal(false);
      setUsernameInput('');
    } catch (err) {
      console.error('Username update failed', err);
    }
  };

  const handleColorApply = async () => {
    try {
      const updatedUser = await usersApi.updateCurrentUser({ name_color: selectedColor });
      useAuthStore.setState({ user: updatedUser });
      setShowColorPicker(false);
    } catch (err) {
      console.error('Color update failed', err);
    }
  };

  const handleBirthdaySave = async () => {
    const dateStr = `${birthdayYear}-${String(birthdayMonth).padStart(2, '0')}-${String(birthdayDay).padStart(2, '0')}`;
    try {
      const updatedUser = await usersApi.updateCurrentUser({ birthday: dateStr });
      useAuthStore.setState({ user: updatedUser });
      setShowBirthdayPicker(false);
    } catch (err) {
      console.error('Birthday update failed', err);
    }
  };

  const handleBirthdayRemove = async () => {
    try {
      const updatedUser = await usersApi.updateCurrentUser({ birthday: null });
      useAuthStore.setState({ user: updatedUser });
      setShowBirthdayPicker(false);
    } catch (err) {
      console.error('Birthday remove failed', err);
    }
  };

  const handleBack = () => {
    if (activeView !== 'info') {
      setActiveView('info');
    } else {
      closeInfoPanel();
      openSettings();
    }
  };

  const InfoRow = ({ icon, label, value, onClick, badge }) => (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '14px',
        backgroundColor: 'transparent',
        border: 'none',
        cursor: 'pointer',
        borderBottom: '1px solid var(--border)',
      }}
      onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
      onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
    >
      <span style={{ fontSize: '18px', width: '24px', textAlign: 'center' }}>{icon}</span>
      <span style={{ fontSize: '15px', color: 'var(--text-primary)', flex: 1, textAlign: 'left' }}>
        {label}
      </span>
      {badge && (
        <span style={{
          fontSize: '11px',
          color: 'var(--accent-hover)',
          fontWeight: '600',
          backgroundColor: 'rgba(43, 82, 120, 0.3)',
          padding: '2px 6px',
          borderRadius: '10px',
          marginRight: '4px',
        }}>
          {badge}
        </span>
      )}
      <span style={{ fontSize: '14px', color: 'var(--accent-hover)' }}>{value}</span>
    </button>
  );

  if (!isInfoPanelOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isInfoPanelOpen ? 'open' : ''}`}
        onClick={() => {
          closeInfoPanel();
        }}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`right-panel ${isInfoPanelOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          right: 0,
          top: 0,
          width: '320px',
          height: '100vh',
          backgroundColor: 'var(--bg-secondary)',
          zIndex: 200,
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-4px 0 12px rgba(0,0,0,0.3)',
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
          <button
            onClick={handleBack}
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
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            flex: 1,
            marginLeft: '12px',
            textAlign: 'left',
          }}>
            {activeView === 'chat-automation' ? 'Chat Automation' : 'Info'}
          </h2>
          <button
            onClick={closeInfoPanel}
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

        {/* Content */}
        {activeView === 'chat-automation' ? (
          <ChatAutomationView onClose={() => setActiveView('info')} />
        ) : (
          <div style={{ flex: 1, overflowY: 'auto', position: 'relative' }}>
            {/* Avatar Section */}
            <div style={{ padding: '20px 20px 12px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  borderRadius: '50%',
                  backgroundColor: selectedColor || 'var(--accent)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '28px',
                  fontWeight: '600',
                  color: 'white',
                  backgroundImage: user?.avatar ? `url(${user.avatar})` : 'none',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}>
                  {!user?.avatar && getInitials(user?.username)}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    position: 'absolute',
                    bottom: '0',
                    right: '-2px',
                    width: '28px',
                    height: '28px',
                    borderRadius: '50%',
                    backgroundColor: '#20b2aa',
                    border: '3px solid var(--bg-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
                    <circle cx="12" cy="13" r="4" />
                  </svg>
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarUpload}
                  style={{ display: 'none' }}
                />
              </div>
              <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '2px' }}>
                {user?.username}
              </div>
              <div style={{ fontSize: '13px', color: '#4caf50', marginBottom: '8px' }}>online</div>
            </div>

            {/* Bio Section */}
            <div style={{ padding: '8px 16px 4px', position: 'relative' }}>
              <div style={{
                position: 'absolute',
                right: '16px',
                top: '8px',
                fontSize: '11px',
                color: 'var(--text-secondary)',
              }}>
                {70 - bio.length}
              </div>
              <textarea
                value={bio}
                onChange={(e) => {
                  if (e.target.value.length <= 70) setBio(e.target.value);
                }}
                onBlur={handleBioBlur}
                placeholder="Any details such as age, occupation or city.\nExample: 23 y.o. designer from San Francisco"
                rows={3}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.4',
                }}
              />
            </div>

            {/* Info Rows */}
            {/* Name */}
            {editingName ? (
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    value={editNameValue}
                    onChange={(e) => { setEditNameValue(e.target.value); setNameError(''); }}
                    autoFocus
                    style={{
                      flex: 1,
                      backgroundColor: 'var(--bg-primary)',
                      border: '1px solid var(--border)',
                      borderRadius: '6px',
                      padding: '8px 12px',
                      color: 'white',
                      fontSize: '14px',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                    onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleNameSave(); }}
                  />
                  <button
                    onClick={handleNameSave}
                    style={{
                      backgroundColor: 'var(--accent)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      padding: '8px 16px',
                      cursor: 'pointer',
                      fontSize: '13px',
                    }}
                  >
                    Save
                  </button>
                </div>
                {nameError && (
                  <div style={{ fontSize: '12px', color: 'var(--error)', marginTop: '4px' }}>{nameError}</div>
                )}
              </div>
            ) : (
              <InfoRow
                icon="👤"
                label="Name"
                value={user?.username || ''}
                onClick={() => { setEditNameValue(user?.username || ''); setEditingName(true); setNameError(''); }}
              />
            )}

            {/* Phone/Email */}
            <InfoRow
              icon="📞"
              label={user?.phone ? "Phone number" : "Email"}
              value={user?.phone || user?.email || ''}
              onClick={() => setShowPhonePopup(true)}
            />

            {/* t.me/username */}
            <InfoRow
              icon="@"
              label="t.me/username"
              value={user?.username ? user.username : 'Add username'}
              onClick={() => { setUsernameInput(user?.username || ''); setShowUsernameModal(true); }}
            />

            {/* Personal channel */}
            <InfoRow
              icon="📢"
              label="Personal channel"
              value="Add"
              onClick={() => setShowPersonalChannelModal(true)}
            />

            {/* Chat automation */}
            <InfoRow
              icon="🤖"
              label="Chat automation"
              badge="NEW"
              value="Off"
              onClick={() => setActiveView('chat-automation')}
            />

            {/* Your name color */}
            <InfoRow
              icon="🎨"
              label="Your name color"
              value={
                <span style={{ color: selectedColor, fontWeight: '600', fontSize: '13px' }}>
                  {user?.username || 'Username'}
                </span>
              }
              onClick={() => { setSelectedColor(user?.name_color || '#2b5278'); setShowColorPicker(true); }}
            />

            {/* Birthday */}
            <InfoRow
              icon="🎂"
              label="Birthday"
              value={user?.birthday ? formatBirthday(birthdayDay, birthdayMonth, birthdayYear) : 'Add'}
              onClick={() => setShowBirthdayPicker(true)}
            />

            {/* Add Account */}
            <div style={{ padding: '16px', textAlign: 'center' }}>
              <button
                onClick={() => alert('Feature coming soon')}
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  color: 'var(--accent-hover)',
                  fontSize: '15px',
                  padding: '12px',
                  width: '100%',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-hover)" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 8v8m-4-4h8" />
                </svg>
                Add Account
              </button>
            </div>

            {/* Modals */}
            {showUsernameModal && (
              <UsernameModal
                value={usernameInput}
                onChange={setUsernameInput}
                onSave={handleUsernameSave}
                onClose={() => { setShowUsernameModal(false); }}
              />
            )}
            {showPersonalChannelModal && (
              <PersonalChannelModal
                onClose={() => setShowPersonalChannelModal(false)}
                onStartChannel={() => {
                  setShowPersonalChannelModal(false);
                  closeInfoPanel();
                  openNewChannelModal();
                }}
              />
            )}
            {showColorPicker && (
              <ColorPicker
                tab={colorPickerTab}
                setTab={setColorPickerTab}
                selectedColor={selectedColor}
                setSelectedColor={setSelectedColor}
                icons={colorPickerIcons}
                setIcons={setColorPickerIcons}
                nameIcons={nameIcons}
                setNameIcons={setNameIcons}
                onApply={handleColorApply}
                onClose={() => setShowColorPicker(false)}
                username={user?.username || ''}
              />
            )}
            {showBirthdayPicker && (
              <BirthdayPicker
                day={birthdayDay}
                month={birthdayMonth}
                year={birthdayYear}
                setDay={setBirthdayDay}
                setMonth={setBirthdayMonth}
                setYear={setBirthdayYear}
                onSave={handleBirthdaySave}
                onRemove={handleBirthdayRemove}
                onClose={() => setShowBirthdayPicker(false)}
              />
            )}
            {showPhonePopup && (
              <PhonePopup onClose={() => setShowPhonePopup(false)} />
            )}
          </div>
        )}
      </div>
    </>
  );
};

const ChatAutomationView = () => (
  <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
      <div style={{ fontSize: '48px', marginBottom: '12px' }}>🤖</div>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
        Add a bot to answer messages on your behalf.
      </div>
    </div>
    <div style={{ marginBottom: '20px' }}>
      <input
        type="text"
        placeholder="Enter bot URL or username"
        style={{
          width: '100%',
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: '2px solid var(--accent)',
          padding: '8px 0',
          color: 'white',
          fontSize: '15px',
          outline: 'none',
        }}
      />
    </div>
    <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
      Choose a bot to manage your chats automatically.
    </div>
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '12px', fontWeight: '500' }}>
        Chats the bot can access
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-primary)', cursor: 'pointer' }}>
          <span style={{ color: 'var(--accent-hover)' }}>●</span>
          All Private Chats Except...
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: 'var(--text-secondary)', cursor: 'pointer' }}>
          <span style={{ fontSize: '14px' }}>○</span>
          Only Selected Chats
        </label>
      </div>
    </div>
    <div>
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '8px', fontWeight: '500' }}>
        Excluded chats
      </div>
      <button style={{
        backgroundColor: 'transparent',
        border: '1px dashed var(--text-secondary)',
        borderRadius: '8px',
        padding: '10px 16px',
        color: 'var(--accent-hover)',
        fontSize: '14px',
        cursor: 'pointer',
        width: '100%',
        textAlign: 'center',
      }}>
        ⊖ Exclude Chats
      </button>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '8px' }}>
        Select chats or entire chat categories which the bot will not have access to.
      </div>
    </div>
  </div>
);

const UsernameModal = ({ value, onChange, onSave, onClose }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      borderRadius: '16px',
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        padding: '24px',
        width: '280px',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Username</h3>
      <div style={{ display: 'flex', alignItems: 'center', borderBottom: '2px solid var(--accent)', padding: '4px 0', marginBottom: '12px' }}>
        <span style={{ color: 'var(--text-secondary)', fontSize: '15px' }}>@</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
          placeholder="username"
          autoFocus
          style={{
            flex: 1,
            backgroundColor: 'transparent',
            border: 'none',
            color: 'white',
            fontSize: '15px',
            outline: 'none',
            marginLeft: '4px',
          }}
        />
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
        You can choose a username on Telegram. If you do, other people will be able to find you by this username and contact you without knowing your phone number.
      </div>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
        You can use a-z, 0-9 and underscores. Minimum length is 5 characters.
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 16px',
          }}
        >
          Save
        </button>
      </div>
    </div>
  </div>
);

const PersonalChannelModal = ({ onClose, onStartChannel }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      borderRadius: '16px',
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        padding: '24px',
        width: '280px',
        textAlign: 'center',
      }}
    >
      <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '16px' }}>Personal channel</h3>
      <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
        You don't have any public channels yet.
      </div>
      <button
        onClick={onStartChannel}
        style={{
          backgroundColor: 'transparent',
          border: 'none',
          color: 'var(--accent-hover)',
          fontSize: '14px',
          cursor: 'pointer',
          marginBottom: '16px',
        }}
      >
        Start a Channel
      </button>
      <div>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 24px',
          }}
        >
          Done
        </button>
      </div>
    </div>
  </div>
);

const ColorPicker = ({ tab, setTab, selectedColor, setSelectedColor, icons, setIcons, nameIcons, setNameIcons, onApply, onClose, username }) => {
  const colors = tab === 'profile'
    ? [...COLORS_1, ...COLORS_2]
    : NAME_COLORS;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 300,
        borderRadius: '16px',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          margin: 'auto',
          borderRadius: '12px',
          width: '280px',
          maxHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
          {['Profile', 'Name'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t.toLowerCase())}
              style={{
                flex: 1,
                padding: '12px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: tab === t.toLowerCase() ? 'var(--accent-hover)' : 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: tab === t.toLowerCase() ? '600' : '400',
                borderBottom: tab === t.toLowerCase() ? '2px solid var(--accent-hover)' : '2px solid transparent',
              }}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
          <h4 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '12px' }}>
            Color preview
          </h4>

          {tab === 'profile' ? (
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: selectedColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '28px',
                fontWeight: '600',
                color: 'white',
                margin: '0 auto 8px',
              }}>
                {getInitials(username)}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)' }}>{username}</div>
              <div style={{ fontSize: '12px', color: '#4caf50' }}>online</div>
            </div>
          ) : (
            <div style={{ marginBottom: '16px' }}>
              <div style={{
                fontSize: '18px',
                fontWeight: '700',
                color: selectedColor,
                marginBottom: '12px',
              }}>
                {username}
              </div>
              <div style={{
                backgroundColor: 'var(--bg-secondary)',
                borderRadius: '8px',
                padding: '12px',
                borderLeft: '3px solid ' + selectedColor,
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}>
                <span style={{ color: selectedColor, fontWeight: '600' }}>{username}</span> / Reply to your message
              </div>
            </div>
          )}

          {/* Color Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: '6px', marginBottom: '16px' }}>
            {colors.map((color, i) => (
              <button
                key={i}
                onClick={() => setSelectedColor(color)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  backgroundColor: color,
                  border: selectedColor === color ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  outline: selectedColor === color ? `2px solid ${color}` : 'none',
                  padding: 0,
                }}
              />
            ))}
          </div>

          {/* Add icons toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '8px 0',
            borderBottom: '1px solid var(--border)',
            marginBottom: '8px',
          }}>
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              {tab === 'profile' ? 'Add icons to Profile' : 'Add icons to replies'}
            </span>
            <button
              onClick={() => tab === 'profile' ? setIcons(!icons) : setNameIcons(!nameIcons)}
              style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                backgroundColor: (tab === 'profile' ? icons : nameIcons) ? 'var(--accent-hover)' : 'var(--text-secondary)',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 0.2s',
              }}
            >
              <div style={{
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                backgroundColor: 'white',
                position: 'absolute',
                top: '2px',
                left: (tab === 'profile' ? icons : nameIcons) ? '20px' : '2px',
                transition: 'left 0.2s',
              }} />
            </button>
          </div>

          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', lineHeight: '1.4' }}>
            You can change the color of your name and customize replies to you. Change &gt;
          </div>

          {/* Gifts section */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
            <span style={{ borderBottom: '2px solid var(--accent-hover)', paddingBottom: '4px', color: 'var(--text-primary)' }}>My Gifts</span>
            <span style={{ paddingBottom: '4px' }}>Vice Cream</span>
            <span style={{ paddingBottom: '4px' }}>Chill Flame 🧸</span>
          </div>

          <div style={{ textAlign: 'center', padding: '16px 0' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>🦆</div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              You don't have any gifts you can use as a profile cover.
            </div>
            <button style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--accent-hover)',
              fontSize: '13px',
              cursor: 'pointer',
              marginTop: '8px',
            }}>
              Browse gifts available for purchase &gt;
            </button>
          </div>
        </div>

        {/* Apply button */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onApply}
            style={{
              width: '100%',
              backgroundColor: 'var(--accent)',
              border: 'none',
              borderRadius: '8px',
              padding: '10px',
              color: 'white',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
          >
            🔒 APPLY STYLE
          </button>
        </div>
      </div>
    </div>
  );
};

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

function ScrollColumn({ items, selectedIndex, onChange, label }) {
  const containerRef = useRef(null);
  const itemHeight = 36;

  useEffect(() => {
    if (containerRef.current) {
      const scrollTo = selectedIndex * itemHeight;
      containerRef.current.scrollTop = scrollTo;
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(() => {
    if (containerRef.current) {
      const idx = Math.round(containerRef.current.scrollTop / itemHeight);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      onChange(clamped);
    }
  }, [items.length, onChange]);

  return (
    <div style={{ flex: 1, textAlign: 'center' }}>
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: '500' }}>{label}</div>
      <div
        ref={containerRef}
        onScroll={handleScroll}
        style={{
          height: itemHeight * 5,
          overflowY: 'scroll',
          scrollSnapType: 'y mandatory',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        <div style={{ height: itemHeight * 2 }} />
        {items.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              onChange(i);
              if (containerRef.current) {
                containerRef.current.scrollTo({ top: i * itemHeight, behavior: 'smooth' });
              }
            }}
            style={{
              height: `${itemHeight}px`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              scrollSnapAlign: 'center',
              fontSize: i === selectedIndex ? '16px' : '13px',
              color: i === selectedIndex ? 'var(--text-primary)' : 'var(--text-secondary)',
              fontWeight: i === selectedIndex ? '600' : '400',
              borderBottom: i === selectedIndex ? '2px solid var(--accent-hover)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            {item}
          </div>
        ))}
        <div style={{ height: itemHeight * 2 }} />
      </div>
    </div>
  );
}

const BirthdayPicker = ({ day, month, year, setDay, setMonth, setYear, onSave, onRemove, onClose }) => {
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const months = MONTHS;
  const years = Array.from({ length: 111 }, (_, i) => 1910 + i);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 300,
        borderRadius: '16px',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--bg-primary)',
          borderRadius: '12px',
          padding: '20px',
          width: '300px',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', marginBottom: '20px', textAlign: 'center' }}>
          Set your Birthday
        </h3>

        <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
          <ScrollColumn
            items={days}
            selectedIndex={day - 1}
            onChange={(i) => setDay(i + 1)}
            label="Day"
          />
          <ScrollColumn
            items={months}
            selectedIndex={month - 1}
            onChange={(i) => setMonth(i + 1)}
            label="Month"
          />
          <ScrollColumn
            items={years}
            selectedIndex={year - 1910}
            onChange={(i) => setYear(1910 + i)}
            label="Year"
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '8px' }}>
          <button
            onClick={onRemove}
            style={{
              backgroundColor: 'transparent',
              border: '1px solid var(--border)',
              borderRadius: '6px',
              color: 'var(--text-secondary)',
              fontSize: '13px',
              cursor: 'pointer',
              padding: '8px 12px',
            }}
          >
            Remove
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid var(--border)',
                borderRadius: '6px',
                color: 'var(--text-secondary)',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              Cancel
            </button>
            <button
              onClick={onSave}
              style={{
                backgroundColor: 'var(--accent)',
                border: 'none',
                borderRadius: '6px',
                color: 'white',
                fontSize: '13px',
                cursor: 'pointer',
                padding: '8px 16px',
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PhonePopup = ({ onClose }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 300,
      borderRadius: '16px',
    }}
    onClick={onClose}
  >
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        backgroundColor: 'var(--bg-primary)',
        borderRadius: '12px',
        padding: '24px',
        width: '280px',
      }}
    >
      <div style={{ fontSize: '14px', color: 'var(--text-primary)', marginBottom: '20px', lineHeight: '1.5' }}>
        You can only change your phone number using mobile Telegram apps. Please use an official Telegram app on your phone to update your number.
      </div>
      <div style={{ textAlign: 'center' }}>
        <button
          onClick={onClose}
          style={{
            backgroundColor: 'var(--accent)',
            border: 'none',
            borderRadius: '6px',
            color: 'white',
            fontSize: '14px',
            cursor: 'pointer',
            padding: '8px 32px',
          }}
        >
          OK
        </button>
      </div>
    </div>
  </div>
);

export default InfoPanel;
