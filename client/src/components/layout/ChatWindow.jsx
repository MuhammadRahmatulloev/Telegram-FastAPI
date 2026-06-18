import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../../store/chatStore';
import useMessageStore from '../../store/messageStore';
import useWebSocket from '../../hooks/useWebSocket';
import MessageItem from './MessageItem';
import * as messagesApi from '../../api/messagesApi';
import * as filesApi from '../../api/filesApi';
import useAuthStore from '../../store/authStore';
import useCallStore from '../../store/callStore';

const ChatWindow = () => {
  const { activeChat } = useChatStore();
  const { messages, typingUsers, isLoading, setMessages, clearMessages, addMessage } = useMessageStore();
  const { sendMessage, sendTyping, isConnected } = useWebSocket(activeChat?.id);
  const { user } = useAuthStore();

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const recordingTimerRef = useRef(null);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (activeChat) {
      clearMessages();
      fetchMessages();
    }
  }, [activeChat]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchMessages = async () => {
    if (!activeChat) return;
    try {
      const data = await messagesApi.getMessages(activeChat.id);
      setMessages(data);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    }
  };

  const handleSend = () => {
    if (inputValue.trim() && isConnected) {
      sendMessage(inputValue.trim());
      setInputValue('');
      sendTyping(false);
      setIsTyping(false);
    }
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
    if (!isTyping && isConnected) {
      setIsTyping(true);
      sendTyping(true);
    }
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      if (isTyping && isConnected) {
        setIsTyping(false);
        sendTyping(false);
      }
    }, 1000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !activeChat) return;
    try {
      const formData = new FormData();
      formData.append('file', file);
      const uploadedFile = await filesApi.uploadFile(formData);
      await messagesApi.sendMessage({
        chat_id: activeChat.id,
        content: `[File: ${uploadedFile.filename}]`,
        message_type: 'file',
        file_id: uploadedFile.id,
      });
    } catch (error) {
      console.error('Failed to upload file:', error);
    }
  };

  // ─── Voice recording ────────────────────────────────────────────────────────

  const startRecording = async () => {
    if (!activeChat) return;
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : 'audio/ogg;codecs=opus';

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      // FIX: onstop вызывается после полной остановки — здесь отправляем
      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        if (blob.size > 0) {
          await sendVoiceMessage(blob, mimeType);
        }
      };

      recorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      recordingTimerRef.current = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('Microphone access denied. Please allow microphone access.');
    }
  };

  const stopRecording = () => {
    clearInterval(recordingTimerRef.current);
    setIsRecording(false);
    setRecordingSeconds(0);
    // FIX: останавливаем только если запись шла
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === 'recording'
    ) {
      mediaRecorderRef.current.stop(); // → вызовет onstop → sendVoiceMessage
    }
  };

  const sendVoiceMessage = async (blob, mimeType) => {
    if (!activeChat) return;
    try {
      const ext = mimeType.includes('ogg') ? 'ogg' : 'webm';
      const formData = new FormData();
      formData.append('file', blob, `voice_${Date.now()}.${ext}`);

      const uploaded = await filesApi.uploadFile(formData);

      // Отправляем через REST
      const sentMsg = await messagesApi.sendMessage({
        chat_id: activeChat.id,
        content: null,
        message_type: 'voice',
        file_id: uploaded.id,
      });

      // FIX: сразу добавляем в store чтобы голосовое появилось в чате
      addMessage({
        ...sentMsg,
        sender_username: user?.username,
        message_type: 'voice',
        file_id: uploaded.id,
      });
    } catch (err) {
      console.error('Failed to send voice message:', err);
      alert('Failed to send voice message. Please try again.');
    }
  };

  const formatRecordingTime = (s) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  // ────────────────────────────────────────────────────────────────────────────

  const getInitials = (name) => {
    if (!name) return '?';
    return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!activeChat) {
    return (
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        height: '100vh', backgroundColor: 'var(--bg-primary)',
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '8px' }}>
          Select a chat
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'column',
      height: '100vh', backgroundColor: 'var(--bg-primary)',
    }}>
      {/* Header */}
      <div style={{
        padding: '16px', backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '14px', fontWeight: '600', color: 'white',
          }}>
            {getInitials(activeChat.title || 'Chat')}
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 2px 0' }}>
              {activeChat.title || 'Chat'}
            </h2>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>
              {activeChat.members?.length || 0} members
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {activeChat.chat_type === 'private' && activeChat.other_user_id && (
            <button
              onClick={() => useCallStore.getState().openOutgoingConfirm({
                id: activeChat.other_user_id,
                username: activeChat.title || 'Unknown',
              })}
              title="Call"
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-secondary)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.362 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.338 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            </button>
          )}
          <div style={{ fontSize: '12px', color: isConnected ? 'var(--success)' : 'var(--error)' }}>
            {isConnected ? '● Connected' : '● Disconnected'}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        display: 'flex', flexDirection: 'column', gap: '4px',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)' }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem key={message.id} message={message} currentUserId={user?.id} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div style={{ padding: '8px 16px', fontSize: '13px', color: 'var(--text-secondary)', fontStyle: 'italic' }}>
          Someone is typing...
        </div>
      )}

      {/* Input bar */}
      <div style={{
        padding: '16px', backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        display: 'flex', gap: '8px', alignItems: 'flex-end',
      }}>
        {/* Attach file button — hide when recording */}
        {!isRecording && (
          <label style={{
            cursor: 'pointer', padding: '8px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
              <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </label>
        )}

        {/* Text input OR recording indicator */}
        {isRecording ? (
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: '10px',
            backgroundColor: 'var(--bg-primary)', borderRadius: '20px',
            padding: '10px 16px',
          }}>
            <div style={{
              width: '10px', height: '10px', borderRadius: '50%',
              backgroundColor: 'var(--error)',
              animation: 'pulse 1s infinite',
            }} />
            <span style={{ fontSize: '14px', color: 'var(--text-primary)' }}>
              Recording... {formatRecordingTime(recordingSeconds)}
            </span>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
              Release to send
            </span>
          </div>
        ) : (
          <textarea
            value={inputValue}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            style={{
              flex: 1, backgroundColor: 'var(--bg-primary)',
              border: 'none', borderRadius: '20px',
              padding: '10px 16px', color: 'white',
              resize: 'none', fontSize: '14px', maxHeight: '120px',
              outline: 'none', fontFamily: 'inherit',
            }}
            rows={1}
            disabled={!isConnected}
          />
        )}

        {/* Microphone button — shown when input empty */}
        {!inputValue.trim() && (
          <button
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={() => { if (isRecording) stopRecording(); }}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            onTouchEnd={(e) => { e.preventDefault(); stopRecording(); }}
            title="Hold to record voice message"
            style={{
              backgroundColor: isRecording ? 'var(--error)' : 'var(--accent)',
              color: 'white', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.15s, transform 0.1s',
              transform: isRecording ? 'scale(1.12)' : 'scale(1)',
              userSelect: 'none',
            }}
          >
            {isRecording ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                <line x1="12" y1="19" x2="12" y2="23" />
                <line x1="8" y1="23" x2="16" y2="23" />
              </svg>
            )}
          </button>
        )}

        {/* Send button — shown when there is text */}
        {inputValue.trim() && (
          <button
            onClick={handleSend}
            disabled={!isConnected}
            style={{
              backgroundColor: isConnected ? 'var(--accent)' : 'var(--bg-tertiary)',
              color: 'white', border: 'none', borderRadius: '50%',
              width: '44px', height: '44px', flexShrink: 0,
              cursor: isConnected ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background-color 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </button>
        )}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
};

export default ChatWindow;