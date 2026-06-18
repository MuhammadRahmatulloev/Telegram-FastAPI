import React, { useEffect, useRef, useState } from 'react';
import useCallStore from '../../store/callStore';
import useCallSignaling from '../../hooks/useCallSignaling';

const getInitials = (name) => {
  if (!name) return '?';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

const Avatar = ({ name, size = 120 }) => (
  <div style={{
    width: size,
    height: size,
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: size / 3,
    fontWeight: 600,
    color: 'white',
    margin: '0 auto 16px',
  }}>
    {getInitials(name)}
  </div>
);

const IconButton = ({ onClick, color, label, children }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
    <button
      onClick={onClick}
      style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        border: 'none',
        backgroundColor: color,
        color: 'white',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {children}
    </button>
    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{label}</span>
  </div>
);

const CameraIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M23 7l-7 5 7 5V7z" />
    <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
  </svg>
);

const PhoneIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
  </svg>
);

const PhoneOffIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45c.86.33 1.75.56 2.65.69A2 2 0 0 1 22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const XIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
  </svg>
);

const MicOffIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 1l22 22" />
    <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V4a3 3 0 0 0-5.94-.6" />
    <path d="M17 16.95A7 7 0 0 1 5 12v-2M19 10v2a7 7 0 0 1-.11 1.23" />
    <path d="M12 19v3" />
  </svg>
);

const Backdrop = ({ children, wide }) => (
  <div style={{
    position: 'fixed',
    inset: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  }}>
    <div style={{
      backgroundColor: 'var(--bg-secondary)',
      borderRadius: '16px',
      padding: '32px',
      width: wide ? '420px' : '300px',
      textAlign: 'center',
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
    }}>
      {children}
    </div>
  </div>
);

const useElapsedSeconds = (active) => {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) {
      setSeconds(0);
      return;
    }
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
};

const formatDuration = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
  const s = (totalSeconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const CallModal = () => {
  const { status, peer, callType, error, isMuted } = useCallStore();
  const {
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    cancelOutgoing,
  } = useCallSignaling();

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const duration = useElapsedSeconds(status === 'connected');

  useEffect(() => {
    if (localVideoRef.current) localVideoRef.current.srcObject = localStream;
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
  }, [remoteStream]);

  useEffect(() => {
    if (status === 'ended') {
      const timer = setTimeout(() => useCallStore.getState().reset(), 2500);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleToggleMute = () => {
    useCallStore.getState().toggleMute();
    if (localStream) {
      localStream.getAudioTracks().forEach((t) => {
        t.enabled = !t.enabled;
      });
    }
  };

  if (status === 'idle') return null;

  if (status === 'outgoing-confirm') {
    return (
      <Backdrop>
        <Avatar name={peer?.username} />
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '18px' }}>
          {peer?.username}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 24px' }}>
          Click on the Camera icon if you want to start a video call.
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <IconButton color="var(--accent)" label="Start Video" onClick={() => startCall(peer, 'video')}>
            <CameraIcon />
          </IconButton>
          <IconButton color="var(--bg-tertiary)" label="Cancel" onClick={() => useCallStore.getState().reset()}>
            <XIcon />
          </IconButton>
          <IconButton color="var(--success)" label="Start Call" onClick={() => startCall(peer, 'audio')}>
            <PhoneIcon />
          </IconButton>
        </div>
        {error && <p style={{ color: 'var(--error)', fontSize: '12px', marginTop: '16px' }}>{error}</p>}
      </Backdrop>
    );
  }

  if (status === 'calling') {
    return (
      <Backdrop>
        <Avatar name={peer?.username} />
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '18px' }}>
          {peer?.username}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 24px' }}>
          Calling{callType === 'video' ? ' (video)' : ''}...
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <IconButton color="var(--error)" label="Cancel" onClick={cancelOutgoing}>
            <PhoneOffIcon />
          </IconButton>
        </div>
      </Backdrop>
    );
  }

  if (status === 'incoming') {
    return (
      <Backdrop>
        <Avatar name={peer?.username} />
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '18px' }}>
          {peer?.username}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: '0 0 24px' }}>
          Incoming {callType === 'video' ? 'video' : 'audio'} call
        </p>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          <IconButton color="var(--error)" label="Decline" onClick={rejectCall}>
            <PhoneOffIcon />
          </IconButton>
          <IconButton color="var(--success)" label="Accept" onClick={acceptCall}>
            <PhoneIcon />
          </IconButton>
        </div>
      </Backdrop>
    );
  }

  if (status === 'ended') {
    return (
      <Backdrop>
        <Avatar name={peer?.username} />
        <h3 style={{ color: 'var(--text-primary)', margin: '0 0 4px', fontSize: '18px' }}>
          {peer?.username}
        </h3>
        <p style={{ color: 'var(--error)', fontSize: '14px', margin: 0 }}>
          {error}
        </p>
      </Backdrop>
    );
  }

  // status === 'connected'
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      {callType === 'video' ? (
        <div style={{ position: 'relative', width: '70%', maxWidth: '800px' }}>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ width: '100%', borderRadius: '12px', backgroundColor: '#000' }}
          />
          <video
            ref={localVideoRef}
            autoPlay
            playsInline
            muted
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '12px',
              width: '120px',
              borderRadius: '8px',
              border: '2px solid var(--bg-secondary)',
              backgroundColor: '#000',
            }}
          />
        </div>
      ) : (
        <>
          <Avatar name={peer?.username} size={140} />
          <h2 style={{ color: 'white', margin: '0 0 4px' }}>{peer?.username}</h2>
        </>
      )}
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '16px 0 32px' }}>
        {formatDuration(duration)}
      </p>
      <div style={{ display: 'flex', gap: '24px' }}>
        <IconButton
          color="var(--bg-tertiary)"
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={handleToggleMute}
        >
          {isMuted ? <MicOffIcon /> : <MicIcon />}
        </IconButton>
        <IconButton color="var(--error)" label="Hang up" onClick={hangUp}>
          <PhoneOffIcon />
        </IconButton>
      </div>
    </div>
  );
};

export default CallModal;