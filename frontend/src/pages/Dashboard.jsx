import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Terminal, Award, FastForward, Play } from 'lucide-react';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) return null;

  const isCompleted = user.currentLevel > 10;

  return (
    <div className="max-w-4xl mx-auto py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 mb-8"
      >
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-primary/20 pb-6 mb-6">
          <div>
            <h1 className="text-3xl font-bold glitch mb-2 text-white" data-text={`AGENT: ${user.username}`}>
              AGENT: {user.username.toUpperCase()}
            </h1>
            <p className="text-gray-400 font-mono tracking-widest uppercase text-sm">
              Clearance Level: {isCompleted ? 'MAXIMUM' : user.currentLevel}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <div className="text-lg text-primary glow-text">
              Total Points: {user.totalPoints}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-black/40 border border-primary/20 p-4 rounded flex items-center space-x-4">
            <Terminal className="text-primary w-8 h-8" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Current Target</p>
              <p className="text-xl font-bold">{isCompleted ? '---' : `Level ${user.currentLevel}`}</p>
            </div>
          </div>
          <div className="bg-black/40 border border-primary/20 p-4 rounded flex items-center space-x-4">
            <Award className="text-blue-500 w-8 h-8" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Levels Conquered</p>
              <p className="text-xl font-bold">{isCompleted ? 10 : user.currentLevel - 1} / 10</p>
            </div>
          </div>
          <div className="bg-black/40 border border-primary/20 p-4 rounded flex items-center space-x-4">
            <FastForward className="text-accent w-8 h-8" />
            <div>
              <p className="text-xs text-gray-400 uppercase">Total Time Elapsed</p>
              <p className="text-xl font-bold">
                {(user.completedLevels || []).length > 0
                  ? `${Math.floor((user.completedLevels || []).reduce((a, b) => a + b.timeTaken, 0) / 60)}m ${(user.completedLevels || []).reduce((a, b) => a + b.timeTaken, 0) % 60}s`
                  : '0m 0s'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          {isCompleted ? (
            <div className="text-center">
              <h2 className="text-2xl font-bold text-accent glow-text mb-4">SYSTEM CONQUERED</h2>
              <p className="text-gray-300">You have successfully completed all challenges.</p>
              <Link to="/leaderboard" className="hacker-btn mt-6 inline-block">
                Check Global Rankings
              </Link>
            </div>
          ) : (
            <Link to="/level" className="hacker-btn text-xl py-4 px-12 flex items-center space-x-2 animate-pulse">
              <Play className="w-6 h-6" />
              <span>{user.currentLevel === 1 ? 'START CHALLENGE' : 'RESUME CHALLENGE'}</span>
            </Link>
          )}
        </div>
      </motion.div>

      {(user.completedLevels || []).length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-bold mb-4 border-b border-primary/30 inline-block pb-1">Activity Log</h3>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-left font-mono text-sm">
              <thead>
                <tr className="bg-primary/10 border-b border-primary/20">
                  <th className="p-4">Level</th>
                  <th className="p-4 relative">Status</th>
                  <th className="p-4">Time Taken</th>
                  <th className="p-4 text-right">Points Earned</th>
                </tr>
              </thead>
              <tbody>
                {(user.completedLevels || []).sort((a, b) => b.levelNumber - a.levelNumber).map(level => (
                  <tr key={level.levelNumber} className="border-b border-gray-800 hover:bg-white/5 transition-colors">
                    <td className="p-4">Level {level.levelNumber}</td>
                    <td className="p-4 text-primary">COMPLETED</td>
                    <td className="p-4">{Math.floor(level.timeTaken / 60)}m {level.timeTaken % 60}s</td>
                    <td className="p-4 text-right font-bold text-blue-400">+{level.pointsEarned}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default Dashboard;
