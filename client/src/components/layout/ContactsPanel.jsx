import React, { useState, useEffect } from 'react';
import useUIStore from '../../store/uiStore';
import { getContacts } from '../../api/contactsApi';
import useChat from '../../hooks/useChat';

const ContactsPanel = () => {
  const { isContactsOpen, closeContacts, openNewContactModal } = useUIStore();
  const { createNewChat } = useChat();
  const [contacts, setContacts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isContactsOpen) {
      fetchContacts();
    }
  }, [isContactsOpen]);

  const fetchContacts = async () => {
    setIsLoading(true);
    try {
      const response = await getContacts();
      const sortedContacts = response.data.sort((a, b) => 
        a.first_name.localeCompare(b.first_name)
      );
      setContacts(sortedContacts);
    } catch (error) {
      console.error('Failed to fetch contacts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredContacts = contacts.filter((contact) =>
    contact.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contact.username?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const handleStartChat = async (contact) => {
    try {
      const result = await createNewChat({
        chat_type: 'private',
        member_ids: [contact.contact_user_id],
      });
      if (result.success) {
        closeContacts();
      }
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  if (!isContactsOpen) return null;

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
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '12px',
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text-primary)',
          }}>
            Contacts
          </h2>
          <button
            onClick={closeContacts}
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

        <div style={{
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
            Loading contacts...
          </div>
        ) : filteredContacts.length === 0 ? (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: 'var(--text-secondary)',
            padding: '20px',
            textAlign: 'center',
          }}>
            {searchQuery ? 'No contacts found' : 'No contacts yet. Add your first contact!'}
          </div>
        ) : (
          filteredContacts.map((contact) => (
            <div
              key={contact.id}
              onClick={() => handleStartChat(contact)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hover)'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
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
                {getInitials(contact.first_name)}
              </div>
              <div style={{
                flex: 1,
                overflow: 'hidden',
              }}>
                <div style={{
                  fontWeight: '500',
                  fontSize: '15px',
                  color: 'var(--text-primary)',
                  marginBottom: '2px',
                }}>
                  {contact.first_name} {contact.last_name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                }}>
                  @{contact.username}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div style={{
        padding: '12px 16px',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <button
          onClick={openNewContactModal}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'white',
            border: 'none',
            borderRadius: '20px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
        >
          Add Contact
        </button>
        <button
          onClick={closeContacts}
          style={{
            backgroundColor: 'transparent',
            color: 'var(--text-primary)',
            border: '1px solid var(--border)',
            borderRadius: '20px',
            padding: '10px 16px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default ContactsPanel;
