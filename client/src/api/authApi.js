import axios from './axios';

export const register = async (email, username, password, phone = null) => {
  const response = await axios.post('/auth/register', {
    email,
    username,
    password,
    phone,
  });
  return response.data;
};

export const verify = async (email, code) => {
  const response = await axios.post('/auth/verify', {
    email,
    code,
  });
  return response.data;
};

export const login = async (email, password) => {
  const response = await axios.post('/auth/login', {
    email,
    password,
  });
  return response.data;
};

export const refreshToken = async (refreshToken) => {
  const response = await axios.post('/auth/refresh', {
    refresh_token: refreshToken,
  });
  return response.data;
};

export const logout = async (refreshToken) => {
  const response = await axios.post('/auth/logout', {
    refresh_token: refreshToken,
  });
  return response.data;
};
