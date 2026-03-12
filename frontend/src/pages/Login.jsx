import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      // Wait, if they login but haven't solved the puzzle, AuthContext sets the user, 
      // and the ProtectedRoute will intercept and send to puzzle page if needed.
      // But the ProtectedRoute only wraps /dashboard and /level.
      // Let's rely on standard redirection or the GuestRoute logic in App.jsx.
      // Actually, GuestRoute intercepts and redirects.
      // In GuestRoute: if (user.puzzleSolved) /dashboard else /init-puzzle.
      // Wait, we need to do it here manually for immediate effect since navigate is explicit.
      // The state update in context will re-render GuestRoute and kick them out, but better to explicitly navigate to root and let App.jsx handle the rest, or just navigate to /dashboard.
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.puzzleRequired) {
          // Edge case where API rejects login because puzzle not solved.
          // In my backend I set 403 puzzleRequired.
          setError('Initialization puzzle not completed. Access denied.');
      } else {
          setError(err.response?.data?.message || 'Failed to authenticate');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="glass-card w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50"></div>
        
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-full border border-primary flex items-center justify-center mb-4 glow-border">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl font-bold tracking-widest text-white uppercase glitch" data-text="AUTHENTICATE">
            AUTHENTICATE
          </h2>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 mb-6 rounded text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-xs text-gray-400 mb-1 uppercase tracking-wider">Identifier (Email/Username)</label>
            <input 
              type="text" 
              required
              className="terminal-input w-full bg-black/50"
              placeholder="root@system.local"
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
            {loading ? 'Verifying...' : 'Establish Connection'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          No access credentials? <Link to="/signup" className="text-primary hover:underline">Request Access</Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
