import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import * as authApi from '../api/authApi';
import * as usersApi from '../api/usersApi';

const useAuth = () => {
  const navigate = useNavigate();
  const { setTokens, setUser, logout, setLoading } = useAuthStore();

  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      // Теперь login только отправляет код, не возвращает токены
      await authApi.login(email, password);
      navigate('/verify-login', { state: { email } });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Login failed',
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate]);

  const verifyLogin = useCallback(async (email, code) => {
    try {
      setLoading(true);
      const { access_token, refresh_token } = await authApi.verifyLogin(email, code);
      setTokens(access_token, refresh_token);

      const user = await usersApi.getCurrentUser();
      setUser(user);

      navigate('/');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Verification failed',
      };
    } finally {
      setLoading(false);
    }
  }, [setTokens, setUser, setLoading, navigate]);

  const register = useCallback(async (email, username, password, phone = null) => {
    try {
      setLoading(true);
      await authApi.register(email, username, password, phone);
      navigate('/verify', { state: { email } });
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Registration failed',
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate]);

  const verify = useCallback(async (email, code) => {
    try {
      setLoading(true);
      await authApi.verify(email, code);
      navigate('/login');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Verification failed',
      };
    } finally {
      setLoading(false);
    }
  }, [setLoading, navigate]);

  const logoutUser = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (refreshToken) {
        await authApi.logout(refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
      navigate('/login');
    }
  }, [logout, navigate]);

  return {
    login,
    verifyLogin,
    register,
    verify,
    logout: logoutUser,
  };
};

export default useAuth;