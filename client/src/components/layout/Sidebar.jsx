import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useChatStore from '../../store/chatStore';
import useUIStore from '../../store/uiStore';
import useAuthStore from '../../store/authStore';
import { formatTime } from '../../utils/formatDate';
import useChat from '../../hooks/useChat';

const Sidebar = () => {
  const { chats, activeChat, isLoading, setActiveChat } = useChat();
  const { openProfile } = useUIStore();
  const { user } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.members?.some((m) => m.username?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getInitials = (name) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

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
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <div style={{
          flex: 1,
          position: 'relative',
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}>
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.35-4.35" />
          </svg>
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: 'var(--bg-primary)',
              border: 'none',
              borderRadius: '20px',
              padding: '8px 12px 8px 40px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
        <button
          onClick={openProfile}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            backgroundColor: 'var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: '600',
            color: 'white',
            cursor: 'pointer',
            border: 'none',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
        >
          {getInitials(user?.username)}
        </button>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
      }}>
        {isLoading ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
          }}>
            Loading chats...
          </div>
        ) : filteredChats.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            padding: '20px',
            textAlign: 'center',
          }}>
            No chats found
          </div>
        ) : (
          filteredChats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChat(chat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
                borderRadius: 'var(--radius)',
                backgroundColor: activeChat?.id === chat.id ? 'var(--accent)' : 'transparent',
              }}
              onMouseEnter={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.backgroundColor = 'var(--hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (activeChat?.id !== chat.id) {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
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
                {getInitials(chat.title || chat.members?.[0]?.username || 'Unknown')}
              </div>
              <div style={{
                flex: 1,
                overflow: 'hidden',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '2px',
                }}>
                  <span style={{
                    fontWeight: '500',
                    fontSize: '15px',
                    color: 'var(--text-primary)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {chat.title || chat.members?.[0]?.username || 'Unknown'}
                  </span>
                  {chat.last_message_at && (
                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                    }}>
                      {formatTime(chat.last_message_at)}
                    </span>
                  )}
                </div>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '13px',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  margin: 0,
                }}>
                  {chat.last_message || 'No messages yet'}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Sidebar;
