import React, { useState } from 'react';
import { formatTime } from '../../utils/formatDate';
import * as messagesApi from '../../api/messagesApi';

const MessageItem = ({ message, currentUserId }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(message.content);
  const [showActions, setShowActions] = useState(false);

  const isOwnMessage = message.sender_id === currentUserId;

  const handleEdit = async () => {
    if (editedContent.trim()) {
      await messagesApi.updateMessage(message.id, editedContent);
      setIsEditing(false);
    }
  };

  const handleDelete = async () => {
    await messagesApi.deleteMessage(message.id);
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

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: isOwnMessage ? 'flex-end' : 'flex-start',
        maxWidth: '65%',
        marginLeft: isOwnMessage ? 'auto' : '0',
        marginRight: isOwnMessage ? '0' : 'auto',
      }}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {!isOwnMessage && (
        <div style={{
          fontSize: '12px',
          color: 'var(--accent-hover)',
          fontWeight: '600',
          marginBottom: '2px',
          marginLeft: '12px',
        }}>
          {message.sender_username}
        </div>
      )}

      {isEditing ? (
        <div style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'center',
        }}>
          <input
            type="text"
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              color: 'white',
              fontSize: '14px',
              outline: 'none',
              minWidth: '200px',
            }}
            autoFocus
          />
          <button
            onClick={handleEdit}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
            onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
          >
            Save
          </button>
          <button
            onClick={() => setIsEditing(false)}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div
          style={{
            maxWidth: '65%',
            padding: '8px 12px',
            borderRadius: isOwnMessage ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
            margin: '2px 0',
            backgroundColor: isOwnMessage ? 'var(--message-out)' : 'var(--message-in)',
            alignSelf: isOwnMessage ? 'flex-end' : 'flex-start',
          }}
        >
          <div style={{
            fontSize: '14px',
            lineHeight: '1.5',
            wordWrap: 'break-word',
            color: 'var(--text-primary)',
          }}>
            {message.content}
          </div>
          <div style={{
            fontSize: '11px',
            color: 'var(--text-secondary)',
            textAlign: 'right',
            marginTop: '4px',
          }}>
            {formatTime(message.created_at)}
          </div>
        </div>
      )}

      {isOwnMessage && showActions && !isEditing && (
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '4px',
        }}>
          <button
            onClick={() => setIsEditing(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 8px',
            }}
            onMouseEnter={(e) => e.target.style.color = 'var(--text-primary)'}
            onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
          >
            Edit
          </button>
          <button
            onClick={handleDelete}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--error)',
              cursor: 'pointer',
              fontSize: '12px',
              padding: '4px 8px',
            }}
            onMouseEnter={(e) => e.target.style.color = '#ff6b6b'}
            onMouseLeave={(e) => e.target.style.color = 'var(--error)'}
          >
            Delete
          </button>
        </div>
      )}

      {message.is_read && isOwnMessage && (
        <div style={{
          fontSize: '11px',
          color: 'var(--text-secondary)',
          marginTop: '2px',
          marginRight: '4px',
        }}>
          ✓✓
        </div>
      )}
    </div>
  );
};

export default MessageItem;
