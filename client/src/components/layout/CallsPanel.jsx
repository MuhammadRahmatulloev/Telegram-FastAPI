import React, { useEffect, useState, useCallback } from 'react';
import useUIStore from '../../store/uiStore';
import { getCallHistory } from '../../api/callsApi';

const PhoneIncoming = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="16 2 16 8 22 8" />
    <line x1="23" y1="1" x2="16" y2="8" />
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const PhoneOutgoing = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="23 7 23 1 17 1" />
    <line x1="16" y1="8" x2="23" y2="1" />
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const VideoIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const getInitials = (name) => {
  if (!name) return '?';
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const statusConfig = {
  ended:    { color: 'var(--success)',        label: 'Ended' },
  missed:   { color: 'var(--error)',          label: 'Missed' },
  rejected: { color: 'var(--error)',          label: 'Declined' },
  active:   { color: 'var(--accent)',         label: 'Active' },
  pending:  { color: 'var(--text-secondary)', label: 'Pending' },
};

const formatCallTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  if (isToday) {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
};

const CallsPanel = () => {
  const { isCallsOpen, closeCalls } = useUIStore();
  const [calls, setCalls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getCallHistory();
      setCalls(data);
    } catch (err) {
      console.error('Failed to load call history:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isCallsOpen) {
      loadHistory();
    }
  }, [isCallsOpen, loadHistory]);

  if (!isCallsOpen) return null;

  return (
    <div style={{
      width: '300px',
      minWidth: '300px',
      height: '100vh',
      backgroundColor: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
            Calls
          </h2>
          <button
            onClick={closeCalls}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              padding: '8px', borderRadius: '50%',
            }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {isLoading ? (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            height: '100%', color: 'var(--text-secondary)', fontSize: '14px',
          }}>
            Loading...
          </div>
        ) : calls.length === 0 ? (
          <div style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', height: '100%',
            color: 'var(--text-secondary)', textAlign: 'center', padding: '20px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.4 }}>
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <div style={{ fontSize: '14px', marginBottom: '4px' }}>No calls yet</div>
            <div style={{ fontSize: '12px' }}>Your call history will appear here</div>
          </div>
        ) : (
          calls.map((call) => {
            const cfg = statusConfig[call.status] || statusConfig.ended;
            return (
              <div
                key={call.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderBottom: '1px solid var(--border)',
                  cursor: 'default',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {/* Avatar */}
                <div style={{
                  width: '42px', height: '42px', borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '14px', fontWeight: '600', color: 'white', flexShrink: 0,
                }}>
                  {getInitials(call.peer_username)}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: '14px', fontWeight: '500',
                    color: 'var(--text-primary)',
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {call.peer_username}
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '5px',
                    marginTop: '2px',
                  }}>
                    {/* Direction arrow */}
                    <span style={{ color: cfg.color, display: 'flex', alignItems: 'center' }}>
                      {call.is_outgoing ? <PhoneOutgoing /> : <PhoneIncoming />}
                    </span>
                    {/* Video badge */}
                    {call.call_type === 'video' && (
                      <span style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}>
                        <VideoIcon />
                      </span>
                    )}
                    <span style={{ fontSize: '12px', color: cfg.color }}>
                      {call.is_outgoing
                        ? (call.status === 'ended' ? 'Outgoing' : cfg.label)
                        : (call.status === 'ended' ? 'Incoming' : cfg.label)
                      }
                    </span>
                  </div>
                </div>

                {/* Time */}
                <div style={{
                  fontSize: '11px', color: 'var(--text-secondary)',
                  flexShrink: 0, textAlign: 'right',
                }}>
                  {formatCallTime(call.started_at)}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default CallsPanel;