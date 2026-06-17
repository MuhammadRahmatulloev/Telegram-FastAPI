import React, { useState } from 'react';
import useUIStore from '../../store/uiStore';
import useContactsStore from '../../store/contactsStore';
import { addContact } from '../../api/contactsApi';

const NewContactModal = () => {
  const { isNewContactModalOpen, closeNewContactModal } = useUIStore();
  const addContactToStore = useContactsStore((state) => state.addContact);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isNewContactModalOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!phone.trim()) {
      setError('Phone number is required');
      return;
    }

    setIsLoading(true);
    try {
      const response = await addContact({
        phone: '+992' + phone.replace(/\D/g, ''),
        first_name: '',
        last_name: null,
      });
      addContactToStore(response.data);
      setPhone('');
      closeNewContactModal();
    } catch (err) {
      const errorMessage = err.response?.data?.detail || 'Failed to add contact';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPhone('');
    setError('');
    closeNewContactModal();
  };

  return (
    <>
      <div
        className={`panel-overlay ${isNewContactModalOpen ? 'open' : ''}`}
        onClick={handleCancel}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'var(--overlay-bg)',
          zIndex: 100,
        }}
      />
      <div
        className={`hamburger-panel ${isNewContactModalOpen ? 'open' : ''}`}
        style={{
          position: 'fixed',
          left: '50%',
          top: '50%',
          transform: isNewContactModalOpen ? 'translate(-50%, -50%)' : 'translate(-50%, -50%) scale(0.9)',
          opacity: isNewContactModalOpen ? 1 : 0,
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
          padding: '24px',
        }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '600',
            color: 'var(--text-primary)',
            marginBottom: '24px',
          }}>
            New Contact
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '8px',
              }}>
                📞 Phone Number *
              </label>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: 'var(--bg-primary)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                padding: '12px 16px',
              }}>
                <span style={{ color: 'var(--text-secondary)', marginRight: '8px' }}>+992</span>
                <input
                  type="tel"
                  placeholder="__ ___ ____"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            {error && (
              <div style={{
                color: 'var(--error)',
                fontSize: '13px',
                marginBottom: '16px',
              }}>
                {error}
              </div>
            )}

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end',
            }}>
              <button
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
                style={{
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = 'var(--hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = 'transparent';
                }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontSize: '14px',
                  opacity: isLoading ? 0.7 : 1,
                }}
                onMouseEnter={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = 'var(--accent-hover)';
                }}
                onMouseLeave={(e) => {
                  if (!isLoading) e.target.style.backgroundColor = 'var(--accent)';
                }}
              >
                {isLoading ? 'Creating...' : 'Create'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default NewContactModal;