import { create } from 'zustand';

const useUIStore = create((set) => ({
  // UI state
  isHamburgerOpen: false,
  isSettingsOpen: false,
  isProfileOpen: false,
  isCallsOpen: false,
  isContactsOpen: false,
  isNewGroupModalOpen: false,
  isNewChannelModalOpen: false,
  isNewContactModalOpen: false,
  isInfoPanelOpen: false,
  isSettingsSearchOpen: false,
  activeNav: 'chats', // 'chats' | 'calls' | 'saved' | 'contacts'

  // Actions
  toggleHamburger: () => set((state) => ({ isHamburgerOpen: !state.isHamburgerOpen })),
  openHamburger: () => set({ isHamburgerOpen: true }),
  closeHamburger: () => set({ isHamburgerOpen: false }),

  openSettings: () => set({ isSettingsOpen: true }),
  closeSettings: () => set({ isSettingsOpen: false }),

  openProfile: () => set({ isProfileOpen: true }),
  closeProfile: () => set({ isProfileOpen: false }),

  openCalls: () => set({ isCallsOpen: true, activeNav: 'calls' }),
  closeCalls: () => set({ isCallsOpen: false, activeNav: 'chats' }),

  openContacts: () => set({ isContactsOpen: true, activeNav: 'contacts' }),
  closeContacts: () => set({ isContactsOpen: false, activeNav: 'chats' }),

  openNewGroupModal: () => set({ isNewGroupModalOpen: true }),
  closeNewGroupModal: () => set({ isNewGroupModalOpen: false }),

  openNewChannelModal: () => set({ isNewChannelModalOpen: true }),
  closeNewChannelModal: () => set({ isNewChannelModalOpen: false }),

  openNewContactModal: () => set({ isNewContactModalOpen: true }),
  closeNewContactModal: () => set({ isNewContactModalOpen: false }),

  openInfoPanel: () => set({ isInfoPanelOpen: true, isSettingsOpen: false }),
  closeInfoPanel: () => set({ isInfoPanelOpen: false }),

  openSettingsSearch: () => set({ isSettingsSearchOpen: true }),
  closeSettingsSearch: () => set({ isSettingsSearchOpen: false }),

  setActiveNav: (nav) => set({ activeNav: nav }),

  // Close all modals/panels
  closeAll: () => set({
    isHamburgerOpen: false,
    isSettingsOpen: false,
    isProfileOpen: false,
    isCallsOpen: false,
    isContactsOpen: false,
    isNewGroupModalOpen: false,
    isNewChannelModalOpen: false,
    isNewContactModalOpen: false,
    isInfoPanelOpen: false,
    isSettingsSearchOpen: false,
  }),
}));

export default useUIStore;
