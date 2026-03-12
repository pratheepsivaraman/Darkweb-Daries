import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield } from 'lucide-react';
import { motion } from 'framer-motion';

const SignupPuzzle = () => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { verifyPuzzle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await verifyPuzzle(answer);
      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect sequence.');
      // Glitch effect on error could be added by toggling a class
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-2xl text-center mb-8"
      >
        <Shield className="w-20 h-20 text-accent mx-auto mb-6 animate-pulse" />
        <h2 className="text-3xl font-bold mb-4 glitch" data-text="SYSTEM INITIALIZATION">
          SYSTEM INITIALIZATION
        </h2>
        <p className="text-gray-400 font-mono">
          Before you can access the system, you must prove your worth.
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card w-full max-w-xl p-8"
      >
        <div className="mb-6 font-mono text-sm leading-relaxed text-blue-300 bg-black/40 p-4 rounded border border-blue-900/50">
          <span className="text-gray-500">{"//"} INCOMING TRANSMISSION</span><br/>
          &gt; System locked.<br/>
          &gt; Authentication required via superuser access.<br/>
          &gt; Identify the default administrator account name across Unix systems.<br/>
          &gt; Hint: It has UID 0.<br/>
          <span className="animate-pulse">_</span>
        </div>

        {error && (
          <div className="text-red-500 mb-4 text-center font-bold animate-bounce">
            [ACCESS DENIED] {error}
          </div>
        )}
        
        {success && (
          <div className="text-primary mb-4 text-center font-bold glow-text">
            [ACCESS GRANTED] Initialization complete. Rerouting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input 
            type="text" 
            autoComplete="off"
            className="terminal-input flex-grow text-lg"
            placeholder="Enter answer..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={success || loading}
          />
          <button 
            type="submit" 
            className="hacker-btn whitespace-nowrap"
            disabled={success || loading}
          >
            {loading ? 'Verifying...' : 'Execute'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default SignupPuzzle;
