import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Trophy, Clock, Target, Medal } from 'lucide-react';
import { motion } from 'framer-motion';

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get('/leaderboard');
        setLeaders(res.data);
      } catch (error) {
        console.error('Failed to fetch leaderboard');
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  if (loading) return <div className="text-center mt-20 text-primary">Deciphering global rankings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-10">
        <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4 glow-border rounded-full p-2" />
        <h1 className="text-4xl font-bold uppercase tracking-widest glitch" data-text="HALL OF FAME">
          HALL OF FAME
        </h1>
        <p className="text-gray-400 mt-2">Global Operative Rankings</p>
      </div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass-card overflow-hidden"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-primary/20 text-primary border-b border-primary/30 uppercase text-xs tracking-wider">
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">Operative</th>
                <th className="p-4 text-center">Levels Fixed</th>
                <th className="p-4 text-center">Score</th>
                <th className="p-4 text-right">Total Time</th>
              </tr>
            </thead>
            <tbody>
              {leaders.map((user, index) => (
                <tr key={index} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                  <td className="p-4 text-center font-bold">
                    {index === 0 && <Medal className="w-6 h-6 text-yellow-500 inline-block" />}
                    {index === 1 && <Medal className="w-6 h-6 text-gray-400 inline-block" />}
                    {index === 2 && <Medal className="w-6 h-6 text-yellow-700 inline-block" />}
                    {index > 2 && <span className="text-gray-500 drop-shadow-md">{index + 1}</span>}
                  </td>
                  <td className="p-4 font-mono text-white text-lg">{user.username}</td>
                  <td className="p-4 text-center">
                    <span className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full text-xs border border-blue-500/30 inline-flex items-center space-x-1">
                      <Target className="w-3 h-3" />
                      <span>{user.levelsCompleted}</span>
                    </span>
                  </td>
                  <td className="p-4 text-center text-primary font-bold">{user.totalPoints}</td>
                  <td className="p-4 text-right font-mono text-gray-400 text-sm flex items-center justify-end space-x-1">
                     <Clock className="w-3 h-3" />
                     <span>
                        {Math.floor(user.totalTimeTaken / 60)}m {user.totalTimeTaken % 60}s
                     </span>
                  </td>
                </tr>
              ))}
              {leaders.length === 0 && (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-gray-500 italic">No operatives documented in system yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Leaderboard;
