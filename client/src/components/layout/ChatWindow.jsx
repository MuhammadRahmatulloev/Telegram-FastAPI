import React, { useState, useEffect, useRef } from 'react';
import useChatStore from '../../store/chatStore';
import useMessageStore from '../../store/messageStore';
import useWebSocket from '../../hooks/useWebSocket';
import MessageItem from './MessageItem';
import * as messagesApi from '../../api/messagesApi';
import * as filesApi from '../../api/filesApi';
import useAuthStore from '../../store/authStore';

const ChatWindow = () => {
  const { activeChat } = useChatStore();
  const { messages, typingUsers, isLoading, setMessages, clearMessages } = useMessageStore();
  const { sendMessage, sendTyping, isConnected } = useWebSocket(activeChat?.id);
  const { user } = useAuthStore();
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

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

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (!activeChat) {
    return (
      <div style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-primary)',
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: '600',
          color: 'var(--text-secondary)',
          marginBottom: '8px',
        }}>
          Select a chat
        </h2>
        <p style={{
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          Choose a chat from the sidebar to start messaging
        </p>
      </div>
    );
  }

  return (
    <div style={{
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      backgroundColor: 'var(--bg-primary)',
    }}>
      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '14px',
            fontWeight: '600',
            color: 'white',
          }}>
            {getInitials(activeChat.title || 'Chat')}
          </div>
          <div>
            <h2 style={{
              fontSize: '16px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              margin: '0 0 2px 0',
            }}>
              {activeChat.title || 'Chat'}
            </h2>
            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              margin: 0,
            }}>
              {activeChat.members?.length || 0} members
            </p>
          </div>
        </div>
        <div style={{
          fontSize: '12px',
          color: isConnected ? 'var(--success)' : 'var(--error)',
        }}>
          {isConnected ? '● Connected' : '● Disconnected'}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              currentUserId={user?.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {typingUsers.length > 0 && (
        <div style={{
          padding: '8px 16px',
          fontSize: '13px',
          color: 'var(--text-secondary)',
          fontStyle: 'italic',
        }}>
          Someone is typing...
        </div>
      )}

      <div style={{
        padding: '16px',
        backgroundColor: 'var(--bg-secondary)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        gap: '8px',
        alignItems: 'flex-end',
      }}>
        <label style={{
          cursor: 'pointer',
          padding: '8px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2">
            <path d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </label>

        <textarea
          value={inputValue}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          style={{
            flex: 1,
            backgroundColor: 'var(--bg-primary)',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 16px',
            color: 'white',
            resize: 'none',
            fontSize: '14px',
            maxHeight: '120px',
            outline: 'none',
            fontFamily: 'inherit',
          }}
          rows={1}
          disabled={!isConnected}
        />

        <button
          onClick={handleSend}
          disabled={!inputValue.trim() || !isConnected}
          style={{
            backgroundColor: inputValue.trim() && isConnected ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: 'white',
            border: 'none',
            borderRadius: '50%',
            width: '44px',
            height: '44px',
            cursor: inputValue.trim() && isConnected ? 'pointer' : 'not-allowed',
            fontSize: '18px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            if (inputValue.trim() && isConnected) {
              e.target.style.backgroundColor = 'var(--accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (inputValue.trim() && isConnected) {
              e.target.style.backgroundColor = 'var(--accent)';
            }
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
