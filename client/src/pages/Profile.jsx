import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import * as usersApi from '../api/usersApi';
import useAuth from '../hooks/useAuth';

const Profile = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const { logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (user) {
      setFormData({ username: user.username });
      setPreviewUrl(user.avatar);
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (avatarFile) {
        await usersApi.uploadAvatar({ file: avatarFile });
      }

      if (formData.username !== user.username) {
        await usersApi.updateCurrentUser({ username: formData.username });
      }

      setSuccess('Profile updated successfully');
      setIsEditing(false);

      const updatedUser = await usersApi.getCurrentUser();
      useAuthStore.setState({ user: updatedUser });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
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

  if (!user) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        backgroundColor: 'var(--bg-tertiary)',
      }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--bg-tertiary)',
    }}>
      <div style={{
        width: '400px',
        maxWidth: '90vw',
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '24px',
        }}>
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Profile
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            Manage your account
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: '16px',
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <div style={{ position: 'relative' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                backgroundColor: 'var(--accent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                fontWeight: '600',
                color: 'white',
                marginBottom: '16px',
                backgroundImage: previewUrl ? `url(${previewUrl})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}>
                {!previewUrl && getInitials(user.username)}
              </div>
              {isEditing && (
                <label style={{
                  position: 'absolute',
                  bottom: '16px',
                  right: '0',
                  cursor: 'pointer',
                }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  <div style={{
                    width: '32px',
                    height: '32px',
                    backgroundColor: 'var(--accent)',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </div>
                </label>
              )}
            </div>

            <h2 style={{
              fontSize: '20px',
              fontWeight: '600',
              color: 'var(--text-primary)',
              marginBottom: '4px',
            }}>
              {user.username}
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              {user.email}
            </p>
          </div>

          {isEditing ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '14px',
                  color: 'var(--text-secondary)',
                  marginBottom: '6px',
                }}>
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Enter your username"
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                  onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                  onBlur={(e) => e.target.style.borderColor = 'var(--border)'}
                />
              </div>

              {error && (
                <div style={{
                  color: 'var(--error)',
                  fontSize: '13px',
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}

              {success && (
                <div style={{
                  color: 'var(--success)',
                  fontSize: '13px',
                  textAlign: 'center',
                }}>
                  {success}
                </div>
              )}

              <div style={{
                display: 'flex',
                gap: '8px',
              }}>
                <button
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({ username: user.username });
                    setPreviewUrl(user.avatar);
                    setAvatarFile(null);
                    setError('');
                    setSuccess('');
                  }}
                  style={{
                    flex: 1,
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    padding: '10px 16px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdateProfile}
                  disabled={isLoading}
                  style={{
                    flex: 1,
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
                  {isLoading ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}>
              <button
                onClick={() => setIsEditing(true)}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--accent)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--accent-hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'var(--accent)'}
              >
                Edit Profile
              </button>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--error)',
                  border: '1px solid var(--error)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = 'var(--error)';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = 'var(--error)';
                }}
              >
                Logout
              </button>

              <button
                onClick={() => navigate('/')}
                style={{
                  width: '100%',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px',
                  fontSize: '15px',
                  fontWeight: '500',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = 'var(--hover)'}
                onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
              >
                Back to Chat
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
