import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import useAuthStore from '../store/authStore';

const VerifyLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { verifyLogin } = useAuth();
  const { isLoading } = useAuthStore();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate('/login');
    }
  }, [email, navigate]);

  const handleChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 5);
    setCode(value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (code.length !== 5) {
      setError('Please enter a valid 5-digit code');
      return;
    }

    const result = await verifyLogin(email, code);
    if (!result.success) {
      setError(result.error);
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
            Two-step verification
          </p>
        </div>

        <div style={{
          backgroundColor: 'var(--bg-secondary)',
          padding: '40px',
          borderRadius: '16px',
        }}>
          <div style={{
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            <p style={{
              color: 'var(--text-primary)',
              fontSize: '14px',
              marginBottom: '8px',
            }}>
              Enter the 5-digit code sent to:
            </p>
            <p style={{
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}>
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
          }}>
            <div>
              <input
                type="text"
                placeholder="12345"
                value={code}
                onChange={handleChange}
                maxLength={5}
                autoFocus
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-primary)',
                  border: error ? '1px solid var(--error)' : '1px solid var(--border)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  color: 'white',
                  fontSize: '24px',
                  letterSpacing: '8px',
                  textAlign: 'center',
                  outline: 'none',
                  fontFamily: 'monospace',
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--accent)'}
                onBlur={(e) => e.target.style.borderColor = error ? 'var(--error)' : 'var(--border)'}
              />
              {error && (
                <div style={{
                  color: 'var(--error)',
                  fontSize: '13px',
                  marginTop: '8px',
                  textAlign: 'center',
                }}>
                  {error}
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading || code.length !== 5}
              style={{
                width: '100%',
                backgroundColor: code.length === 5 && !isLoading ? 'var(--accent)' : 'var(--bg-tertiary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                fontSize: '15px',
                fontWeight: '500',
                cursor: code.length === 5 && !isLoading ? 'pointer' : 'not-allowed',
                marginTop: '8px',
                opacity: isLoading ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                if (code.length === 5 && !isLoading) {
                  e.target.style.backgroundColor = 'var(--accent-hover)';
                }
              }}
              onMouseLeave={(e) => {
                if (code.length === 5 && !isLoading) {
                  e.target.style.backgroundColor = 'var(--accent)';
                }
              }}
            >
              {isLoading ? 'Verifying...' : 'Confirm'}
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
              Wrong account?{' '}
              <button
                onClick={() => navigate('/login')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-hover)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: 0,
                }}
              >
                Go back
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyLogin;