import { create } from 'zustand';

const useContactsStore = create((set) => ({
  contacts: [],
  isLoading: false,
  hasFetched: false,

  setContacts: (contacts) => set({ contacts, hasFetched: true }),

  addContact: (contact) =>
    set((state) => ({ contacts: [...state.contacts, contact] })),

  removeContact: (contactUserId) =>
    set((state) => ({
      contacts: state.contacts.filter(
        (c) => c.contact_user_id !== contactUserId
      ),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export default useContactsStore;