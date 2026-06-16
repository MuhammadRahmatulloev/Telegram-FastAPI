import React, { useState } from 'react';
import useUIStore from '../../store/uiStore';

const NewChannelModal = () => {
  const { isNewChannelModalOpen, closeNewChannelModal } = useUIStore();
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');

  if (!isNewChannelModalOpen) return null;

  return (
    <>
      <div
        className={`panel-overlay ${isNewChannelModalOpen ? 'open' : ''}`}
        onClick={closeNewChannelModal}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`hamburger-panel ${isNewChannelModalOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: isNewChannelModalOpen ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: isNewChannelModalOpen ? 1 : 0,
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
        <div style={{
          padding: '32px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: 'var(--teal)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '24px',
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </div>

          <input
            type="text"
            placeholder="Channel name"
            value={channelName}
            onChange={(e) => setChannelName(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--border)',
              padding: '12px 0',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              marginBottom: '16px',
              textAlign: 'center',
            }}
            onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
          />

          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: '2px solid var(--border)',
              padding: '12px 0',
              color: 'white',
              fontSize: '16px',
              outline: 'none',
              marginBottom: '32px',
              textAlign: 'center',
            }}
            onFocus={(e) => e.target.style.borderBottomColor = 'var(--accent)'}
            onBlur={(e) => e.target.style.borderBottomColor = 'var(--border)'}
          />

          <div style={{
            display: 'flex',
            gap: '12px',
            width: '100%',
          }}>
            <button
              onClick={closeNewChannelModal}
              style={{
                flex: 1,
                backgroundColor: 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
            >
              Cancel
            </button>
            <button
              onClick={closeNewChannelModal}
              style={{
                flex: 1,
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
                fontSize: '15px',
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
              onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
            >
              Create
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default NewChannelModal;
