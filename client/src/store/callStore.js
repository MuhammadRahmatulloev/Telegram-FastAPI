import { create } from 'zustand';

const useCallStore = create((set) => ({
  // 'idle' | 'outgoing-confirm' | 'calling' | 'incoming' | 'connected'
  status: 'idle',
  callType: 'audio', // 'audio' | 'video'
  peer: null, // { id, username }
  isMuted: false,
  error: null,

  openOutgoingConfirm: (peer) =>
    set({ status: 'outgoing-confirm', peer, callType: 'audio', error: null }),

  setCalling: (callType) => set({ status: 'calling', callType, error: null }),

  setIncoming: (peer, callType) =>
    set({ status: 'incoming', peer, callType, error: null }),

  setConnected: () => set({ status: 'connected', error: null }),

  setError: (error) => set({ error }),

  endWithReason: (reason) => set({ status: 'ended', error: reason }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  reset: () =>
    set({ status: 'idle', peer: null, callType: 'audio', isMuted: false, error: null }),
}));

export default useCallStore;