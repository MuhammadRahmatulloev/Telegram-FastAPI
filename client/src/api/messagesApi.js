import axios from './axios';

export const getMessages = async (chatId, limit = 50, offset = 0) => {
  const response = await axios.get(
    `/messages/chat/${chatId}?limit=${limit}&offset=${offset}`
  );
  return response.data;
};

export const sendMessage = async (data) => {
  const response = await axios.post('/messages/', data);
  return response.data;
};

export const updateMessage = async (messageId, content) => {
  const response = await axios.put(`/messages/${messageId}`, { content });
  return response.data;
};

export const markAsRead = async (messageId) => {
  const response = await axios.post(`/messages/${messageId}/read`);
  return response.data;
};

export const deleteMessage = async (messageId) => {
  const response = await axios.delete(`/messages/${messageId}`);
  return response.data;
};
