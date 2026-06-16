import React from 'react';
import IconNav from '../components/layout/IconNav';
import Sidebar from '../components/layout/Sidebar';
import ChatWindow from '../components/layout/ChatWindow';
import HamburgerMenu from '../components/layout/HamburgerMenu';
import ProfileModal from '../components/layout/ProfileModal';
import SettingsPanel from '../components/layout/SettingsPanel';
import CallsPanel from '../components/layout/CallsPanel';
import NewGroupModal from '../components/layout/NewGroupModal';
import NewChannelModal from '../components/layout/NewChannelModal';

const Home = () => {
  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      overflow: 'hidden',
      backgroundColor: 'var(--bg-tertiary)',
    }}>
      <IconNav />
      <Sidebar />
      <ChatWindow />
      <HamburgerMenu />
      <ProfileModal />
      <SettingsPanel />
      <CallsPanel />
      <NewGroupModal />
      <NewChannelModal />
    </div>
  );
};

export default Home;
