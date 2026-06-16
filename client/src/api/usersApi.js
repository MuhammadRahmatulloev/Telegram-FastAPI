import axios from './axios';

export const getCurrentUser = async () => {
  const response = await axios.get('/users/me');
  return response.data;
};

export const updateCurrentUser = async (data) => {
  const response = await axios.put('/users/me', data);
  return response.data;
};

export const uploadAvatar = async (formData) => {
  const response = await axios.post('/users/me/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getUserById = async (userId) => {
  const response = await axios.get(`/users/${userId}`);
  return response.data;
};
