import axios from './axios';

export const getChats = async () => {
  const response = await axios.get('/chats/');
  return response.data;
};

export const createChat = async (data) => {
  const response = await axios.post('/chats/', data);
  return response.data;
};

export const getChatById = async (chatId) => {
  const response = await axios.get(`/chats/${chatId}`);
  return response.data;
};

export const addMember = async (chatId, userId) => {
  const response = await axios.post(`/chats/${chatId}/members/${userId}`);
  return response.data;
};

export const removeMember = async (chatId, userId) => {
  const response = await axios.delete(`/chats/${chatId}/members/${userId}`);
  return response.data;
};

export const leaveChat = async (chatId) => {
  const response = await axios.delete(`/chats/${chatId}/leave`);
  return response.data;
};

export const deleteChat = async (chatId) => {
  const response = await axios.delete(`/chats/${chatId}`);
  return response.data;
};
