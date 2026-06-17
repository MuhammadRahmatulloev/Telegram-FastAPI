import api from './axios';

export const getContacts = () => api.get('/contacts/');

export const addContact = (data) => api.post('/contacts/', data);

export const deleteContact = (contactUserId) => 
  api.delete(`/contacts/${contactUserId}`);
