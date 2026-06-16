import { useCallback, useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import useMessageStore from '../store/messageStore';

const useWebSocket = (chatId) => {
  const { accessToken } = useAuthStore();
  const { addMessage, addTypingUser, removeTypingUser } = useMessageStore();
  const wsRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const [isConnected, setIsConnected] = useState(false);
  const maxReconnectAttempts = 3;

  const connect = useCallback(() => {
    if (!chatId || !accessToken) return;

    const wsUrl = `ws://localhost:8000/ws/chat/${chatId}?token=${accessToken}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      reconnectAttemptsRef.current = 0;
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('WebSocket message:', data);

        if (data.event === 'new_message') {
          addMessage(data.data);
        } else if (data.event === 'typing') {
          if (data.data.is_typing) {
            addTypingUser(data.data.user_id);
          } else {
            removeTypingUser(data.data.user_id);
          }
        } else if (data.event === 'message_updated') {
          // Handle message updates if needed
        } else if (data.event === 'message_deleted') {
          // Handle message deletion if needed
        }
      } catch (error) {
        console.error('Failed to parse WebSocket message:', error);
      }
    };

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    wsRef.current.onclose = () => {
      console.log('WebSocket disconnected');
      setIsConnected(false);

      if (reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        console.log(`Reconnecting... Attempt ${reconnectAttemptsRef.current}`);
        setTimeout(connect, 3000);
      }
    };
  }, [chatId, accessToken, addMessage, addTypingUser, removeTypingUser]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((content) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'send_message',
          data: { content },
        })
      );
    }
  }, []);

  const sendTyping = useCallback((isTyping) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'typing',
          data: { is_typing: isTyping },
        })
      );
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    sendMessage,
    sendTyping,
  };
};

export default useWebSocket;
