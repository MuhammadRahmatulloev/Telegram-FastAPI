import axios from './axios';

export const getCallHistory = async () => {
  const response = await axios.get('/calls/history');
  return response.data;
};