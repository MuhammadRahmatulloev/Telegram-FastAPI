import { useCallback, useEffect, useRef, useState } from 'react';
import useAuthStore from '../store/authStore';
import useCallStore from '../store/callStore';
import useMessageStore from '../store/messageStore';
import useChatStore from '../store/chatStore';
import * as messagesApi from '../api/messagesApi';

const ICE_SERVERS = [{ urls: 'stun:stun.l.google.com:19302' }];

// Отправляем системное сообщение о звонке в чат
const sendCallSystemMessage = async (content) => {
  const activeChat = useChatStore.getState().activeChat;
  if (!activeChat) return;
  try {
    const msg = await messagesApi.sendMessage({
      chat_id: activeChat.id,
      content,
      message_type: 'system',
    });
    // Добавляем в store сразу чтобы появилось без перезагрузки
    useMessageStore.getState().addMessage({
      ...msg,
      message_type: 'system',
    });
  } catch (err) {
    console.error('Failed to send call system message:', err);
  }
};

const useCallSignaling = () => {
  const { user, accessToken } = useAuthStore();
  const { setIncoming, setConnected, reset } = useCallStore();

  const wsRef = useRef(null);
  const pcRef = useRef(null);
  const localStreamRef = useRef(null);
  const pendingOfferRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  // Время начала звонка (для длительности)
  const callStartTimeRef = useRef(null);

  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);

  const send = useCallback((payload) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload));
    }
  }, []);

  const cleanupMedia = useCallback(() => {
    if (pcRef.current) {
      pcRef.current.close();
      pcRef.current = null;
    }
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((t) => t.stop());
      localStreamRef.current = null;
    }
    pendingOfferRef.current = null;
    callStartTimeRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
  }, []);

  const getLocalMedia = useCallback(async (type) => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: type === 'video',
    });
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  const createPeerConnection = useCallback((targetUserId) => {
    const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });

    pc.onicecandidate = (e) => {
      if (e.candidate) {
        send({
          event: 'ice_candidate',
          target_user_id: targetUserId,
          data: { candidate: e.candidate },
        });
      }
    };

    pc.ontrack = (e) => {
      setRemoteStream(e.streams[0]);
    };

    pcRef.current = pc;
    return pc;
  }, [send]);

  const startCall = useCallback(async (targetPeer, type) => {
    try {
      useCallStore.getState().setCalling(type);
      const stream = await getLocalMedia(type);
      const pc = createPeerConnection(targetPeer.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      send({
        event: 'call_request',
        target_user_id: targetPeer.id,
        data: { sdp: offer, call_type: type, from_username: user?.username },
      });
      // Звонит бесконечно пока не нажмут Cancel/Hang up
    } catch (err) {
      console.error('Failed to start call:', err);
      cleanupMedia();
      useCallStore.getState().endWithReason('Could not access camera/microphone');
    }
  }, [getLocalMedia, createPeerConnection, send, user, cleanupMedia]);

  const acceptCall = useCallback(async () => {
    const currentPeer = useCallStore.getState().peer;
    const currentType = useCallStore.getState().callType;
    if (!currentPeer || !pendingOfferRef.current) return;
    try {
      const stream = await getLocalMedia(currentType);
      const pc = createPeerConnection(currentPeer.id);
      stream.getTracks().forEach((track) => pc.addTrack(track, stream));

      await pc.setRemoteDescription(pendingOfferRef.current);
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      send({
        event: 'answer',
        target_user_id: currentPeer.id,
        data: { sdp: answer },
      });

      callStartTimeRef.current = Date.now();
      setConnected();
    } catch (err) {
      console.error('Failed to accept call:', err);
      send({ event: 'call_reject', target_user_id: currentPeer.id });
      cleanupMedia();
      useCallStore.getState().endWithReason('Could not access camera/microphone');
    }
  }, [getLocalMedia, createPeerConnection, send, setConnected, cleanupMedia]);

  const rejectCall = useCallback(() => {
    const currentPeer = useCallStore.getState().peer;
    const callType = useCallStore.getState().callType;
    if (currentPeer) {
      send({ event: 'call_reject', target_user_id: currentPeer.id });
    }
    cleanupMedia();
    reset();

    // Системное сообщение — входящий отклонённый звонок
    const icon = callType === 'video' ? '📹' : '📞';
    sendCallSystemMessage(`${icon} Missed ${callType} call`);
  }, [send, cleanupMedia, reset]);

  const hangUp = useCallback(() => {
    const currentPeer = useCallStore.getState().peer;
    const callType = useCallStore.getState().callType;
    const status = useCallStore.getState().status;
    if (currentPeer) {
      send({ event: 'call_end', target_user_id: currentPeer.id });
    }

    // Вычисляем длительность если звонок был принят
    let systemText;
    const icon = callType === 'video' ? '📹' : '📞';
    if (status === 'connected' && callStartTimeRef.current) {
      const durationSec = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
      const m = Math.floor(durationSec / 60);
      const s = durationSec % 60;
      const dur = m > 0 ? `${m}m ${s}s` : `${s}s`;
      systemText = `${icon} ${callType === 'video' ? 'Video' : 'Voice'} call ended • ${dur}`;
    } else {
      // Звонок не был принят — пропущенный
      systemText = `${icon} Missed ${callType} call`;
    }

    cleanupMedia();
    reset();
    sendCallSystemMessage(systemText);
  }, [send, cleanupMedia, reset]);

  const cancelOutgoing = useCallback(() => {
    const currentPeer = useCallStore.getState().peer;
    const callType = useCallStore.getState().callType;
    if (currentPeer) {
      send({ event: 'call_end', target_user_id: currentPeer.id });
    }
    cleanupMedia();
    reset();

    // Отменённый исходящий — как пропущенный для получателя
    const icon = callType === 'video' ? '📹' : '📞';
    sendCallSystemMessage(`${icon} Cancelled ${callType} call`);
  }, [send, cleanupMedia, reset]);

  const connect = useCallback(() => {
    if (!accessToken) return;
    const wsUrl = `ws://localhost:8000/ws/call?token=${accessToken}`;
    wsRef.current = new WebSocket(wsUrl);

    wsRef.current.onopen = () => {
      console.log('Call WebSocket connected');
      reconnectAttemptsRef.current = 0;
    };

    wsRef.current.onmessage = async (event) => {
      let msg;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      const ev = msg.event;
      const fromUserId = msg.from_user_id;
      const data = msg.data || {};

      if (ev === 'call_request') {
        if (useCallStore.getState().status !== 'idle') {
          send({ event: 'call_reject', target_user_id: fromUserId });
          return;
        }
        pendingOfferRef.current = data.sdp;
        setIncoming({ id: fromUserId, username: data.from_username }, data.call_type || 'audio');

      } else if (ev === 'answer') {
        if (pcRef.current) {
          await pcRef.current.setRemoteDescription(data.sdp);
          callStartTimeRef.current = Date.now();
          setConnected();
        }

      } else if (ev === 'ice_candidate') {
        if (pcRef.current && data.candidate) {
          try {
            await pcRef.current.addIceCandidate(data.candidate);
          } catch (err) {
            console.error('Failed to add ICE candidate:', err);
          }
        }

      } else if (ev === 'call_end') {
        // Другая сторона завершила звонок
        const callType = useCallStore.getState().callType;
        const status = useCallStore.getState().status;
        const icon = callType === 'video' ? '📹' : '📞';

        let systemText;
        if (status === 'connected' && callStartTimeRef.current) {
          const durationSec = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
          const m = Math.floor(durationSec / 60);
          const s = durationSec % 60;
          const dur = m > 0 ? `${m}m ${s}s` : `${s}s`;
          systemText = `${icon} ${callType === 'video' ? 'Video' : 'Voice'} call ended • ${dur}`;
        } else {
          systemText = `${icon} Missed ${callType} call`;
        }

        cleanupMedia();
        reset();
        sendCallSystemMessage(systemText);

      } else if (ev === 'call_reject') {
        const callType = useCallStore.getState().callType;
        const icon = callType === 'video' ? '📹' : '📞';
        cleanupMedia();
        useCallStore.getState().endWithReason('Call declined');
        sendCallSystemMessage(`${icon} ${callType === 'video' ? 'Video' : 'Voice'} call declined`);
      }
    };

    wsRef.current.onerror = (err) => {
      console.error('Call WebSocket error:', err);
    };

    wsRef.current.onclose = () => {
      console.log('Call WebSocket disconnected');
      if (reconnectAttemptsRef.current < 5) {
        reconnectAttemptsRef.current += 1;
        setTimeout(connect, 3000);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return {
    localStream,
    remoteStream,
    startCall,
    acceptCall,
    rejectCall,
    hangUp,
    cancelOutgoing,
  };
};

export default useCallSignaling;