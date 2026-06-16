import { useCallback, useEffect } from 'react';
import useChatStore from '../store/chatStore';
import * as chatsApi from '../api/chatsApi';

const useChat = () => {
  const {
    chats,
    activeChat,
    members,
    isLoading,
    setChats,
    setActiveChat,
    addChat,
    updateChat,
    removeChat,
    setMembers,
    addMember,
    removeMember,
    setLoading,
  } = useChatStore();

  const fetchChats = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chatsApi.getChats();
      setChats(data);
    } catch (error) {
      console.error('Failed to fetch chats:', error);
    } finally {
      setLoading(false);
    }
  }, [setChats, setLoading]);

  const createNewChat = useCallback(async (data) => {
    try {
      setLoading(true);
      const chat = await chatsApi.createChat(data);
      addChat(chat);
      setActiveChat(chat);
      return { success: true, chat };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to create chat',
      };
    } finally {
      setLoading(false);
    }
  }, [addChat, setActiveChat, setLoading]);

  const fetchChatById = useCallback(async (chatId) => {
    try {
      setLoading(true);
      const chat = await chatsApi.getChatById(chatId);
      setActiveChat(chat);
      return chat;
    } catch (error) {
      console.error('Failed to fetch chat:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }, [setActiveChat, setLoading]);

  const addMemberToChat = useCallback(async (chatId, userId) => {
    try {
      await chatsApi.addMember(chatId, userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to add member',
      };
    }
  }, []);

  const removeMemberFromChat = useCallback(async (chatId, userId) => {
    try {
      await chatsApi.removeMember(chatId, userId);
      removeMember(userId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to remove member',
      };
    }
  }, [removeMember]);

  const leaveCurrentChat = useCallback(async (chatId) => {
    try {
      await chatsApi.leaveChat(chatId);
      removeChat(chatId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to leave chat',
      };
    }
  }, [removeChat]);

  const deleteCurrentChat = useCallback(async (chatId) => {
    try {
      await chatsApi.deleteChat(chatId);
      removeChat(chatId);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.detail || 'Failed to delete chat',
      };
    }
  }, [removeChat]);

  useEffect(() => {
    fetchChats();
  }, [fetchChats]);

  return {
    chats,
    activeChat,
    members,
    isLoading,
    fetchChats,
    createNewChat,
    fetchChatById,
    setActiveChat,
    updateChat,
    addMemberToChat,
    removeMemberFromChat,
    leaveCurrentChat,
    deleteCurrentChat,
  };
};

export default useChat;
