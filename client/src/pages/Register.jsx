import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';
import { validateEmail, validatePassword, validateUsername } from '../utils/validators';

const Register = () => {
  const { register } = useAuth();
  const { isLoading } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    phone: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setErrors({
      ...errors,
      [e.target.name]: '',
    });
    setApiError('');
  };

  const validateForm = () => {
    const newErrors = {};

    if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!validateUsername(formData.username)) {
      newErrors.username = 'Username must be between 3 and 30 characters';
    }

    if (!validatePassword(formData.password)) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validateForm()) {
      return;
    }

    const phoneValue = formData.phone ? '+992' + formData.phone : null;
    const result = await register(formData.email, formData.username, formData.password, phoneValue);
    if (!result.success) {
      setApiError(result.error);
    }
  };

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
            Telegram
          </h1>
          <p style={{
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}>
            Create a new account
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: '16px',
        }}>
          <form onSubmit={handleSubmit} style={{
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
                Email
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                autoComplete="email"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: errors.email ? '1px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.email ? 'var(--error)' : 'var(--border)'}
              />
              {errors.email && (
                <div style={{
                  color: 'var(--error)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {errors.email}
                </div>
              )}
            </div>

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
                name="username"
                placeholder="Choose a username"
                value={formData.username}
                onChange={handleChange}
                autoComplete="username"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: errors.username ? '1px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.username ? 'var(--error)' : 'var(--border)'}
              />
              {errors.username && (
                <div style={{
                  color: 'var(--error)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {errors.username}
                </div>
              )}
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                Phone number (optional)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '12px',
                  backgroundColor: 'var(--bg-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px 0 0 8px',
                  color: 'var(--text-secondary)',
                  fontSize: '14px',
                }}>+992</span>
                <input
                  type="tel"
                  name="phone"
                  placeholder="__ ___ ____"
                  value={formData.phone}
                  onChange={handleChange}
                  style={{
                    flex: 1,
                    padding: '12px 16px',
                    backgroundColor: 'var(--bg-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: '0 8px 8px 0',
                    color: 'white',
                    fontSize: '14px',
                    outline: 'none',
                  }}
                />
              </div>
            </div>

            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                color: 'var(--text-secondary)',
                marginBottom: '6px',
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                placeholder="Create a password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: errors.password ? '1px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '14px',
                  outline: 'none',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = errors.password ? 'var(--error)' : 'var(--border)'}
              />
              {errors.password && (
                <div style={{
                  color: 'var(--error)',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {errors.password}
                </div>
              )}
            </div>

            {apiError && (
              <div style={{
                color: 'var(--error)',
                fontSize: '13px',
                marginTop: '8px',
                textAlign: 'center',
              }}>
                {apiError}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: '100%',
                backgroundColor: 'var(--accent)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                marginTop: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) e.target.style.backgroundColor = 'var(--accent-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isLoading) e.target.style.backgroundColor = 'var(--accent)';
              }}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              Already have an account?{' '}
              <Link
                to="/login"
                style={{
                  color: 'var(--accent-hover)',
                  cursor: 'pointer',
                }}
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
