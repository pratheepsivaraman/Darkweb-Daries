import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Terminal, LogOut, User as UserIcon, ShieldAlert } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="glass-card m-4 px-6 py-4 flex justify-between items-center z-50">
      <Link to="/" className="flex items-center space-x-2 text-primary hover:text-white transition-colors">
        <Terminal className="w-6 h-6 animate-pulse" />
        <span className="font-bold text-xl tracking-wider glitch">PROJECT_DARK</span>
      </Link>

      <div className="flex items-center space-x-6">
        <Link to="/leaderboard" className="text-gray-300 hover:text-primary transition-colors hover:glow-text">
          Leaderboard
        </Link>
        
        {user ? (
          <>
            <Link to="/dashboard" className="text-gray-300 hover:text-primary transition-colors flex items-center space-x-1">
              <UserIcon className="w-4 h-4" />
              <span>{user.username}</span>
            </Link>
            {user.role === 'admin' && (
              <Link to="/admin" className="text-accent hover:text-white transition-colors flex items-center space-x-1">
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </Link>
            )}
            <button 
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors flex items-center space-x-1"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="text-gray-300 hover:text-primary transition-colors">
              Login
            </Link>
            <Link to="/signup" className="hacker-btn text-sm py-2 px-4">
              Initialize
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
