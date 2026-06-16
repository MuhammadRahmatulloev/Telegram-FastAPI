import { create } from 'zustand';

const useMessageStore = create((set) => ({
  messages: [],
  hasMore: true,
  isLoading: false,
  typingUsers: [],

  setMessages: (messages) => set({ messages }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  updateMessage: (messageId, updatedMessage) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.id === messageId ? { ...msg, ...updatedMessage } : msg
      ),
    })),

  removeMessage: (messageId) =>
    set((state) => ({
      messages: state.messages.filter((msg) => msg.id !== messageId),
    })),

  prependMessages: (messages) =>
    set((state) => ({
      messages: [...messages, ...state.messages],
    })),

  setHasMore: (hasMore) => set({ hasMore }),

  setLoading: (isLoading) => set({ isLoading }),

  setTypingUsers: (typingUsers) => set({ typingUsers }),

  addTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.includes(userId)
        ? state.typingUsers
        : [...state.typingUsers, userId],
    })),

  removeTypingUser: (userId) =>
    set((state) => ({
      typingUsers: state.typingUsers.filter((id) => id !== userId),
    })),

  clearMessages: () => set({ messages: [], hasMore: true }),
}));

export default useMessageStore;
