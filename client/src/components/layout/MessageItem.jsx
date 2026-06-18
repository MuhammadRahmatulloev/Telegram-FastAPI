import React, { useState, useRef } from 'react';
import { formatTime } from '../../utils/formatDate';
import * as messagesApi from '../../api/messagesApi';
import useAuthStore from '../../store/authStore';

// ─── Voice player ────────────────────────────────────────────────────────────
const VoicePlayer = ({ fileId }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [blobUrl, setBlobUrl] = useState(null);
  const [loadError, setLoadError] = useState(false);
  const audioRef = useRef(null);
  const { accessToken } = useAuthStore();

  // Загружаем аудио через fetch с токеном и создаём blob URL
  const loadAudio = async () => {
    if (blobUrl) return; // уже загружено
    try {
      const resp = await fetch(`http://localhost:8000/api/v1/files/serve/${fileId}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!resp.ok) throw new Error('Failed to load audio');
      const blob = await resp.blob();
      setBlobUrl(URL.createObjectURL(blob));
    } catch (err) {
      console.error('Voice load error:', err);
      setLoadError(true);
    }
  };

  const formatDur = (s) => {
    if (!s || isNaN(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const togglePlay = async () => {
    await loadAudio();
    const audio = audioRef.current;
    if (!audio || !blobUrl) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
    setDuration(audio.duration);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * audio.duration;
  };

  if (loadError) {
    return (
      <div style={{ fontSize: '13px', color: 'var(--error)' }}>
        🎤 Voice message (unavailable)
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '200px' }}>
      {blobUrl && (
        <audio
          ref={audioRef}
          src={blobUrl}
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={() => setDuration(audioRef.current?.duration || 0)}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => { setIsPlaying(false); setProgress(0); }}
          preload="metadata"
        />
      )}

      {/* Play/pause */}
      <button
        onClick={togglePlay}
        style={{
          width: '36px', height: '36px', borderRadius: '50%',
          backgroundColor: 'var(--accent)', border: 'none',
          color: 'white', cursor: 'pointer', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="4" width="4" height="16" />
            <rect x="14" y="4" width="4" height="16" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5,3 19,12 5,21" />
          </svg>
        )}
      </button>

      {/* Progress bar + time */}
      <div style={{ flex: 1 }}>
        <div
          onClick={handleSeek}
          style={{
            height: '4px', borderRadius: '2px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            cursor: 'pointer', position: 'relative', marginBottom: '4px',
          }}
        >
          <div style={{
            height: '100%', borderRadius: '2px',
            backgroundColor: 'var(--accent)',
            width: `${progress}%`,
            transition: 'width 0.1s linear',
          }} />
        </div>
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
          {formatDur(duration)}
        </div>
      </div>

      {/* Mic icon */}
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{ flexShrink: 0 }}>
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
      </svg>
    </div>
  );
};

// ─── System message (звонки и т.п.) ──────────────────────────────────────────
const SystemMessage = ({ content, createdAt }) => {
  // Определяем иконку и цвет по содержимому
  const isMissed = content.toLowerCase().includes('missed') || content.toLowerCase().includes('cancelled');
  const isDeclined = content.toLowerCase().includes('declined');
  const isEnded = content.toLowerCase().includes('ended');

  let color = 'var(--text-secondary)';
  if (isMissed || isDeclined) color = 'var(--error, #e53935)';
  if (isEnded) color = 'var(--text-secondary)';

  return (
    <div style={{
      display: 'flex', justifyContent: 'center',
      margin: '8px 0',
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        backgroundColor: 'var(--bg-secondary)',
        borderRadius: '12px',
        padding: '6px 14px',
        fontSize: '13px',
        color,
        maxWidth: '80%',
      }}>
        <span>{content}</span>
        <span style={{ fontSize: '11px', color: 'var(--text-secondary)', marginLeft: '4px' }}>
          {formatTime(createdAt)}
        </span>
      </div>
    </div>
  );
};

// ─── MessageItem ─────────────────────────────────────────────────────────────
const MessageItem = ({ message, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.sender_id === currentUserId;
  const isVoice = message.message_type === 'voice';
  const isSystem = message.message_type === 'system';

  // Системные сообщения отображаем по центру
  if (isSystem) {
    return <SystemMessage content={message.content} createdAt={message.created_at} />;
  }

  const handleEdit = async () => {
    if (editedContent.trim()) {
      await messagesApi.updateMessage(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await messagesApi.deleteMessage(message.id);
  };

  return (
    <div
      style={{ width: '100%', textAlign: isOwnMessage ? 'right' : 'left', margin: '2px 0' }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwnMessage && (
        <div style={{
          fontSize: '12px', color: 'var(--accent-hover)', fontWeight: '600',
          marginBottom: '2px', marginLeft: '12px',
        }}>
          {message.sender_username}
        </div>
      )}

      {isEditing ? (
        <div style={{ display: 'inline-flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border)',
              borderRadius: '8px', padding: '8px 12px', color: 'white',
              fontSize: '14px', outline: 'none', minWidth: '200px',
            }}
            autoFocus
          />
          <button onClick={handleEdit} style={{
            backgroundColor: 'var(--accent)', color: 'white', border: 'none',
            borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
          }}>Save</button>
          <button onClick={() => setIsEditing(false)} style={{
            backgroundColor: 'transparent', color: 'var(--text-primary)',
            border: '1px solid var(--border)', borderRadius: '8px',
            padding: '8px 12px', cursor: 'pointer', fontSize: '13px',
          }}>Cancel</button>
        </div>
      ) : (
        <div style={{
          display: 'inline-block',
          maxWidth: isVoice ? '280px' : '65%',
          minWidth: '60px',
          padding: '8px 12px',
          borderRadius: isOwnMessage ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
          backgroundColor: isOwnMessage ? 'var(--message-out)' : 'var(--message-in)',
          textAlign: 'left',
        }}>
          {isVoice && message.file_id ? (
            <VoicePlayer fileId={message.file_id} />
          ) : (
            <div style={{
              fontSize: '14px', lineHeight: '1.5',
              wordBreak: 'break-word', overflowWrap: 'anywhere',
              whiteSpace: 'pre-wrap', color: 'var(--text-primary)',
            }}>
              {message.content}
            </div>
          )}
          <div style={{
            fontSize: '11px', color: 'var(--text-secondary)',
            textAlign: 'right', marginTop: '4px',
          }}>
            {formatTime(message.created_at)}
          </div>
        </div>
      )}

      {isOwnMessage && showActions && !isEditing && !isVoice && (
        <div style={{ display: 'inline-flex', gap: '12px', marginTop: '4px' }}>
          <button onClick={() => setIsEditing(true)} style={{
            background: 'none', border: 'none', color: 'var(--text-secondary)',
            cursor: 'pointer', fontSize: '12px', padding: '4px 8px',
          }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >Edit</button>
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none', color: 'var(--error)',
            cursor: 'pointer', fontSize: '12px', padding: '4px 8px',
          }}
            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
            onMouseLeave={(e) => e.target.style.color = 'var(--error)'}
          >Delete</button>
        </div>
      )}

      {isOwnMessage && showActions && !isEditing && isVoice && (
        <div style={{ display: 'inline-flex', gap: '12px', marginTop: '4px' }}>
          <button onClick={handleDelete} style={{
            background: 'none', border: 'none', color: 'var(--error)',
            cursor: 'pointer', fontSize: '12px', padding: '4px 8px',
          }}
            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
            onMouseLeave={(e) => e.target.style.color = 'var(--error)'}
          >Delete</button>
        </div>
      )}

      {message.is_read && isOwnMessage && (
        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px', marginRight: '4px' }}>
          ✓✓
        </div>
      )}
    </div>
  );
};

export default MessageItem;