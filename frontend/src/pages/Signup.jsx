import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

const Signup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
        return setError('Passphrase must be at least 6 characters');
    }
    setError('');
    setLoading(true);
    try {
      await register(username, email, password);
      // Wait for re-render or explicitly navigate.
      // After signup, they need to do puzzle.
      navigate('/init-puzzle');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to initialize system connection');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-4 glow-border">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase glitch" data-text="INITIALIZE">
            INITIALIZE
          </h2>
          <p className="text-xs text-primary mt-2">New profile creation protocol</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 mb-6 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Alias (Username)</label>
            <input 
              type="text" 
              required
              className="terminal-input w-full bg-black/50"
              placeholder="h4ck3r_01"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Secure Comms (Email)</label>
            <input 
              type="email" 
              required
              className="terminal-input w-full bg-black/50"
              placeholder="neo@matrix.net"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Passphrase</label>
            <input 
              type="password" 
              required
              className="terminal-input w-full bg-black/50"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full hacker-btn mt-6 flex justify-center py-3"
          >
            {loading ? 'Processing...' : 'Generate Profile'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          Already in the system? <Link to="/login" className="text-primary hover:underline">Authenticate</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Signup;
