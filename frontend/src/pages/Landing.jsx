import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, Target, Award, Terminal } from 'lucide-react';

const Landing = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.3 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <motion.div 
        variants={containerVariants} 
        initial="hidden" 
        animate="visible"
        className="max-w-4xl w-full"
      >
        <motion.div variants={itemVariants} className="mb-8 relative">
          <Terminal className="w-24 h-24 mx-auto text-primary mb-4 animate-pulse opacity-80" />
          <h1 className="text-5xl md:text-7xl font-bold mb-4 glitch" data-text="WELCOME TO THE VOID">
            WELCOME TO THE VOID
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            A 10-level full-stack cybersecurity challenge. Prove your skills, solve the puzzles, and climb the ranks. Only the elite will survive.
          </p>
        </motion.div>

        <motion.div variants={itemVariants} className="flex justify-center gap-6 mb-16">
          <Link to="/signup" className="hacker-btn text-lg py-3 px-8">
            Access System
          </Link>
          <Link to="/leaderboard" className="glass-card hover:border-primary px-8 py-3 transition-colors text-lg">
            View Rankings
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left mt-12 w-full">
          <div className="glass-card p-6 border-t-2 border-t-primary">
            <Shield className="w-10 h-10 text-primary mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Secure Environment</h3>
            <p className="text-gray-400">All data is encrypted. Real-world scenarios designed to test your analytical and penetration testing skills.</p>
          </div>
          <div className="glass-card p-6 border-t-2 border-t-accent">
            <Target className="w-10 h-10 text-accent mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Progressive Difficulty</h3>
            <p className="text-gray-400">10 levels of increasing complexity. From basic encoding to advanced log analysis and exploitation techniques.</p>
          </div>
          <div className="glass-card p-6 border-t-2 border-t-blue-500">
            <Award className="w-10 h-10 text-blue-500 mb-4" />
            <h3 className="text-xl font-bold mb-2 text-white">Global Leaderboard</h3>
            <p className="text-gray-400">Compete against hackers worldwide. Points are calculated based on your solve time and accuracy.</p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
