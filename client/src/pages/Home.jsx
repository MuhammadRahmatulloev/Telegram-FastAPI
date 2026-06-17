import React from 'react';
import IconNav from '../components/layout/IconNav';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import HamburgerMenu from '../components/layout/HamburgerMenu';
import ProfileModal from '../components/layout/ProfileModal';
import SettingsPanel from '../components/layout/SettingsPanel';
import CallsPanel from '../components/layout/CallsPanel';
import ContactsPanel from '../components/layout/ContactsPanel';
import NewGroupModal from '../components/layout/NewGroupModal';
import NewChannelModal from '../components/layout/NewChannelModal';
import NewContactModal from '../components/layout/NewContactModal';
import InfoPanel from '../components/layout/InfoPanel';
import useUIStore from '../store/uiStore';

const Home = () => {
  const { activeNav, isContactsOpen } = useUIStore();

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-tertiary)',
    }}>
      <IconNav />
      {activeNav === 'contacts' || isContactsOpen ? <ContactsPanel /> : <Sidebar />}
      <ChatWindow />
      <HamburgerMenu />
      <ProfileModal />
      <SettingsPanel />
      <CallsPanel />
      <NewGroupModal />
      <NewChannelModal />
      <NewContactModal />
      <InfoPanel />
    </div>
  );
};

export default Home;
