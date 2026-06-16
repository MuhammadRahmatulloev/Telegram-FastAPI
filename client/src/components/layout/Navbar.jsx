import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import Avatar from '../ui/Avatar';
import Button from '../ui/Avatar';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();

  return (
    <nav className="bg-[#232e3c] border-b border-[#0e1621] px-4 py-3">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        <Link to="/" className="text-white font-bold text-xl">
          Telegram
        </Link>

        {isAuthenticated && user ? (
          <div className="flex items-center gap-4">
            <Avatar
              src={user.avatar}
              alt={user.username}
              size="md"
            />
            <span className="text-white font-medium">{user.username}</span>
            <Link
              to="/profile"
              className="text-[#708499] hover:text-white transition-colors"
            >
              Profile
            </Link>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <Link
              to="/login"
              className="text-[#708499] hover:text-white transition-colors"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="text-[#708499] hover:text-white transition-colors"
            >
              Register
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
