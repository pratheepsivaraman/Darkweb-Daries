import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Terminal, Lightbulb, AlertCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

const Level = () => {
  const { user, fetchProfile } = useAuth();
  const navigate = useNavigate();

  const [levelData, setLevelData] = useState(null);
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Timer state
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [clue, setClue] = useState(null);

  useEffect(() => {
    fetchLevel();
  }, []);

  useEffect(() => {
    let interval;
    if (levelData && !success) {
      interval = setInterval(() => {
        const passed = Math.floor((Date.now() - new Date(levelData.startTime).getTime()) / 1000);
        setTimeElapsed(passed);
        
        // Check for clue
        if (!clue && passed >= levelData.thresholdTime) {
          fetchClue();
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [levelData, clue, success]);

  const fetchLevel = async () => {
    try {
      const res = await axios.get('/levels/current');
      if (res.data.completed) {
        navigate('/dashboard');
        return;
      }
      setLevelData(res.data);
      if (res.data.clue) setClue(res.data.clue);
      
      const passed = Math.floor((Date.now() - new Date(res.data.startTime).getTime()) / 1000);
      setTimeElapsed(passed);
    } catch (err) {
      console.error(err);
      setError('Error fetching level configuration.');
    } finally {
      setLoading(false);
    }
  };

  const fetchClue = async () => {
    try {
      const res = await axios.get('/levels/clue');
      setClue(res.data.clue);
    } catch (err) {
      // Threshold not reached or error
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await axios.post('/levels/submit', { answer });
      setSuccess(`Correct! Points Earned: ${res.data.earnedPoints}`);
      
      // Briefly show success, then reload next level or go to dashboard
      setTimeout(() => {
        setSuccess('');
        setAnswer('');
        setClue(null);
        // Refresh context to update currentLevel
        // It's a bit of a hack to reload the page but since it's an SPA we can just fetchLevel
        // After fetching level it will update the UI
        window.location.reload(); 
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Incorrect Payload. Try again.');
    }
  };

  const handleSkip = async () => {
    if (!window.confirm('Are you sure you want to skip this level? You will receive 0 points for it.')) {
      return;
    }

    try {
      await axios.post('/levels/skip');
      setSuccess('Level skipped. Moving to next challenge...');
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Error skipping level.');
    }
  };

  if (loading) return <div className="text-center mt-20 text-primary animate-pulse">Establishing secure connection...</div>;
  if (!levelData) return null;

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const nextThreshold = levelData.thresholdTime - timeElapsed;

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white uppercase glitch" data-text={`LEVEL ${levelData.levelNumber} - ${levelData.title}`}>
          LEVEL {levelData.levelNumber} - {levelData.title}
        </h2>
        <div className="flex items-center space-x-6">
          <div className={`flex items-center space-x-2 text-xl font-mono ${timeElapsed > levelData.thresholdTime ? 'text-red-500' : 'text-primary'}`}>
            <Clock className="w-5 h-5" />
            <span>{formatTime(timeElapsed)}</span>
          </div>
          <button 
            onClick={handleSkip}
            className="text-xs font-mono border border-red-500/50 text-red-500/70 hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
          >
            SKIP_LEVEL {'>>'}
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-6 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-transparent to-primary opacity-50"></div>
        
        <div className="mb-8 p-6 bg-black/60 rounded border border-primary/20 font-mono text-lg leading-relaxed shadow-inner">
          <Terminal className="w-5 h-5 text-gray-500 mb-2 inline-block mr-2" />
          <span className="text-blue-300">{levelData.question}</span>
          
          {/* Specific content rendering based on level type */}
          {levelData.content && (
             <div className="mt-4 p-4 bg-black border border-gray-800 rounded font-mono text-sm overflow-x-auto text-green-400">
               {levelData.content.imageUrl && (
                 <div className="mb-6 relative group">
                    <div className="absolute -inset-0.5 bg-primary/20 rounded-lg blur opacity-50 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative overflow-hidden rounded-lg border border-primary/30 bg-black">
                      <div className="bg-primary/10 px-3 py-1 border-b border-primary/20 flex items-center justify-between">
                        <span className="text-[10px] text-primary/70 uppercase tracking-widest font-bold flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          Attached_Evidence_001.jpg
                        </span>
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 rounded-full bg-red-500/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-yellow-500/50"></div>
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500/50"></div>
                        </div>
                      </div>
                      <img 
                        src={levelData.content.imageUrl} 
                        alt="Level Content" 
                        className="max-w-full h-auto mx-auto block opacity-80 hover:opacity-100 transition-opacity duration-500"
                        onLoad={(e) => {
                          // Simple scanline effect overlay
                          e.target.style.filter = 'contrast(1.1) brightness(0.9) sepia(0.1)';
                        }}
                      />
                      <div className="absolute inset-0 pointer-events-none bg-scanlines opacity-10"></div>
                    </div>
                 </div>
               )}
               {levelData.content.hexData && <div>{levelData.content.hexData}</div>}
               {levelData.content.logs && levelData.content.logs.map((log, i) => <div key={i}>{log}</div>)}
               {levelData.content.letters && <div>{levelData.content.letters.join(' ')}</div>}
               {levelData.content.syslog && <pre className="whitespace-pre-wrap">{levelData.content.syslog}</pre>}
               {levelData.content.binary && <div className="break-all">{levelData.content.binary}</div>}
               {levelData.content.headers && <pre className="whitespace-pre-wrap">{levelData.content.headers}</pre>}
               {levelData.content.scenario && <pre className="whitespace-pre-wrap">{levelData.content.scenario}</pre>}
               {levelData.content.signal && <div className="text-xl tracking-widest font-bold">{levelData.content.signal}</div>}
               {levelData.content.hash && <div>{levelData.content.hash}</div>}
               {levelData.content.text && <div>{levelData.content.text}</div>}
             </div>
          )}
        </div>

        {clue ? (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8 p-4 border border-yellow-500/50 bg-yellow-500/10 rounded flex items-start space-x-3"
          >
            <Lightbulb className="text-yellow-500 w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h4 className="text-yellow-500 font-bold text-sm uppercase mb-1">Decryption Key Discovered</h4>
              <p className="text-gray-300 font-mono text-sm whitespace-pre-wrap">{clue}</p>
            </div>
          </motion.div>
        ) : (
          <div className="mb-8 p-3 text-center text-xs text-gray-500 border border-gray-800 rounded bg-black/30 flex items-center justify-center space-x-2">
            <AlertCircle className="w-4 h-4" />
            <span>Clue system unlocking in {formatTime(nextThreshold > 0 ? nextThreshold : 0)}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-500/20 border border-primary text-primary p-4 mb-6 rounded font-bold text-center glow-text">
            {success}
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 mb-6 rounded font-bold text-center animate-pulse">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-4">
          <input 
            type="text" 
            autoComplete="off"
            className="terminal-input flex-grow text-xl py-3 px-4 bg-black/50"
            placeholder="Submit flag/payload..."
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={!!success}
            autoFocus
          />
          <button 
            type="submit" 
            className="hacker-btn text-lg px-8"
            disabled={!!success || !answer.trim()}
          >
            Submit
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default Level;
