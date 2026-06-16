import { create } from 'zustand';

const useChatStore = create((set) => ({
  chats: [],
  activeChat: null,
  members: [],
  isLoading: false,

  setChats: (chats) => set({ chats }),

  setActiveChat: (chat) => set({ activeChat: chat, members: [] }),

  addChat: (chat) => set((state) => ({ chats: [chat, ...state.chats] })),

  updateChat: (chatId, updatedChat) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.id === chatId ? { ...chat, ...updatedChat } : chat
      ),
      activeChat:
        state.activeChat?.id === chatId
          ? { ...state.activeChat, ...updatedChat }
          : state.activeChat,
    })),

  removeChat: (chatId) =>
    set((state) => ({
      chats: state.chats.filter((chat) => chat.id !== chatId),
      activeChat: state.activeChat?.id === chatId ? null : state.activeChat,
    })),

  setMembers: (members) => set({ members }),

  addMember: (member) =>
    set((state) => ({ members: [...state.members, member] })),

  removeMember: (userId) =>
    set((state) => ({
      members: state.members.filter((member) => member.id !== userId),
    })),

  setLoading: (isLoading) => set({ isLoading }),
}));

export default useChatStore;
