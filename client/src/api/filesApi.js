import axios from './axios';

export const uploadFile = async (formData) => {
  const response = await axios.post('/files/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getFile = async (fileId) => {
  const response = await axios.get(`/files/${fileId}`);
  return response.data;
};

export const getFiles = async () => {
  const response = await axios.get('/files/');
  return response.data;
};

export const deleteFile = async (fileId) => {
  const response = await axios.delete(`/files/${fileId}`);
  return response.data;
};
