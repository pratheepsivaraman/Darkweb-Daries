import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Trash2, ShieldAlert, Activity, CheckCircle, 
  XCircle, PlusCircle, Save, LayoutDashboard, 
  Trophy, Settings, AlertTriangle, RefreshCw,
  Search, Edit2, ChevronRight
} from 'lucide-react';

// Configure axios base URL
const defaultApiUrl = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || defaultApiUrl,
  withCredentials: true
});

// Add interceptor for JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [users, setUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Edit/Add Level State
  const [editingLevel, setEditingLevel] = useState(null);
  const [newLevel, setNewLevel] = useState({
    levelNumber: '',
    title: '',
    question: '',
    answer: '',
    clue: '',
    thresholdTime: 300,
    maxPoints: 100,
    imageUrl: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [usersRes, statsRes, levelsRes, leaderboardRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/stats'),
        api.get('/admin/levels'),
        api.get('/leaderboard')
      ]);
      
      setUsers(usersRes.data);
      setStats(statsRes.data);
      setLevels(levelsRes.data);
      setLeaderboard(leaderboardRes.data);
    } catch (error) {
      console.error('Error fetching admin data', error);
      setError(error.response?.data?.message || 'Failed to fetch admin data. Ensure you are logged in as an administrator.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetUser = async (userId) => {
    if (window.confirm('Are you sure you want to reset this user\'s progress?')) {
      try {
        await api.put(`/admin/users/${userId}/reset`);
        fetchData();
        alert('User progress reset.');
      } catch (error) {
        alert('Failed to reset user.');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('CRITICAL: Delete this user account entirely? This cannot be undone.')) {
      try {
        await api.delete(`/admin/users/${userId}`);
        fetchData();
        alert('User terminated.');
      } catch (error) {
        alert('Failed to delete user.');
      }
    }
  };

  const handleAddLevel = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newLevel,
        content: { ...newLevel.content, imageUrl: newLevel.imageUrl }
      };
      
      if (editingLevel) {
        await api.put(`/admin/levels/${editingLevel._id}`, payload);
        alert('Level updated!');
      } else {
        await api.post('/admin/levels', payload);
        alert('Level added successfully!');
      }
      setNewLevel({
        levelNumber: '',
        title: '',
        question: '',
        answer: '',
        clue: '',
        thresholdTime: 300,
        maxPoints: 100,
        imageUrl: ''
      });
      setEditingLevel(null);
      fetchData();
    } catch (error) {
      alert('Operation failed: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteLevel = async (levelId) => {
    if (window.confirm('Delete this level?')) {
      try {
        await api.delete(`/admin/levels/${levelId}`);
        fetchData();
      } catch (error) {
        alert('Failed to delete level.');
      }
    }
  };

  const startEditLevel = (level) => {
    setEditingLevel(level);
    setNewLevel({
      levelNumber: level.levelNumber,
      title: level.title,
      question: level.question,
      answer: level.answer || '', // Backend might not send answer if not selected
      clue: level.clue,
      thresholdTime: level.thresholdTime,
      maxPoints: level.maxPoints,
      imageUrl: level.content?.imageUrl || ''
    });
    setActiveTab('levels'); // Switch to levels tab if not there
  };

  const filteredUsers = users.filter(u => 
    u.username.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading && !stats) return <div className="text-center mt-20 text-accent animate-pulse">Establishing Secure Connection...</div>;

  if (error) return (
    <div className="max-w-7xl mx-auto py-20 px-4 text-center">
      <div className="glass-card p-10 border-red-500/30 bg-red-500/5">
        <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">ACCESS_DENIED</h2>
        <p className="text-gray-400 mb-6">{error}</p>
        <button 
          onClick={() => window.location.href = '/login'}
          className="hacker-btn px-8 py-2"
        >
          Re-Authenticate
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 flex flex-col md:flex-row gap-8">
      {/* SIDEBAR NAVIGATION */}
      <aside className="w-full md:w-64 space-y-2">
        <div className="flex items-center space-x-2 mb-8 px-2">
          <ShieldAlert className="w-8 h-8 text-accent" />
          <h1 className="text-xl font-bold text-white uppercase tracking-tighter">Core Admin</h1>
        </div>
        
        <button 
          onClick={() => setActiveTab('overview')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'overview' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span>System Overview</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('users')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'users' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Users className="w-5 h-5" />
          <span>User Registry</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('leaderboard')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'leaderboard' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Trophy className="w-5 h-5" />
          <span>Leaderboard</span>
        </button>
        
        <button 
          onClick={() => setActiveTab('levels')}
          className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all ${activeTab === 'levels' ? 'bg-accent/20 text-accent border border-accent/30' : 'text-gray-400 hover:bg-white/5'}`}
        >
          <Settings className="w-5 h-5" />
          <span>Challenge Config</span>
        </button>

        <div className="pt-8 px-4">
            <div className="text-[10px] text-gray-600 uppercase tracking-[0.2em] mb-2 font-bold">System Status</div>
            <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                <span className="text-xs text-green-500 font-mono">ENCRYPTED_LINK_ACTIVE</span>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-grow">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <LayoutDashboard className="text-accent" />
                System Statistics
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-card p-6 border-l-4 border-l-blue-500">
                <Users className="w-8 h-8 text-blue-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-widest">Active Operatives</p>
                <p className="text-3xl font-bold font-mono">{stats?.totalUsers}</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-purple-500">
                <Activity className="w-8 h-8 text-purple-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-widest">Total Attempts</p>
                <p className="text-3xl font-bold font-mono">{stats?.totalSubmissions}</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-green-500">
                <CheckCircle className="w-8 h-8 text-green-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-widest">Successful Solves</p>
                <p className="text-3xl font-bold font-mono">{stats?.correctSubmissions}</p>
              </div>
              <div className="glass-card p-6 border-l-4 border-l-red-500">
                <XCircle className="w-8 h-8 text-red-500 mb-2" />
                <p className="text-gray-400 text-xs uppercase tracking-widest">System Denials</p>
                <p className="text-3xl font-bold font-mono">{stats?.incorrectSubmissions}</p>
              </div>
            </div>

            <div className="glass-card p-8 bg-gradient-to-br from-black/60 to-accent/5 border-accent/10">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                    <AlertTriangle className="text-yellow-500 w-5 h-5" />
                    Security Briefing
                </h3>
                <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    The system is currently hosting <span className="text-white font-bold">{stats?.totalUsers}</span> operatives across <span className="text-white font-bold">{levels.length}</span> active challenges. 
                    The average solve rate is <span className="text-primary font-bold">
                        {stats?.totalSubmissions > 0 ? ((stats.correctSubmissions / stats.totalSubmissions) * 100).toFixed(1) : 0}%
                    </span>.
                </p>
                <div className="flex gap-4">
                    <button onClick={fetchData} className="flex items-center gap-2 text-xs bg-white/5 hover:bg-white/10 px-4 py-2 rounded transition-colors">
                        <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        Refresh Logs
                    </button>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Operative Registry</h2>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input 
                        type="text" 
                        placeholder="Search by alias or ID..."
                        className="bg-black/40 border border-white/10 rounded-full py-2 pl-10 pr-4 text-sm focus:border-accent outline-none w-full sm:w-64"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="glass-card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm font-mono">
                        <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                            <tr>
                                <th className="p-4">Operative Alias</th>
                                <th className="p-4">Secure Email</th>
                                <th className="p-4 text-center">Progress</th>
                                <th className="p-4 text-center">Score</th>
                                <th className="p-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map(user => (
                                <tr key={user._id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                                    <td className="p-4">
                                        <div className="flex items-center gap-2">
                                            <span className="text-white font-bold">{user.username}</span>
                                            {user.role === 'admin' && <span className="bg-red-500/10 text-red-500 text-[8px] px-1.5 py-0.5 border border-red-500/20 rounded font-bold">ADMIN</span>}
                                        </div>
                                    </td>
                                    <td className="p-4 text-gray-500 text-xs">{user.email}</td>
                                    <td className="p-4 text-center">
                                        <span className="text-white">Level {user.currentLevel}</span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span className="text-primary">{user.totalPoints}</span>
                                    </td>
                                    <td className="p-4">
                                        <div className="flex items-center justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                            {user.role !== 'admin' && (
                                                <>
                                                    <button 
                                                        onClick={() => handleResetUser(user._id)}
                                                        title="Reset Progress"
                                                        className="p-2 hover:bg-yellow-500/20 hover:text-yellow-500 rounded transition-colors"
                                                    >
                                                        <RefreshCw className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDeleteUser(user._id)}
                                                        title="Terminate Account"
                                                        className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
            <h2 className="text-2xl font-bold text-white">Global Ranking Status</h2>
            <div className="glass-card overflow-hidden">
                <table className="w-full text-left text-sm font-mono">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400">
                        <tr>
                            <th className="p-4 text-center w-16">Rank</th>
                            <th className="p-4">Alias</th>
                            <th className="p-4 text-center">Levels</th>
                            <th className="p-4 text-center">Total Time</th>
                            <th className="p-4 text-right">Points</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard.map((entry, idx) => (
                            <tr key={idx} className={`border-b border-white/5 hover:bg-white/5 transition-colors ${idx < 3 ? 'bg-primary/5' : ''}`}>
                                <td className="p-4 text-center">
                                    {idx === 0 && <span className="text-xl">🥇</span>}
                                    {idx === 1 && <span className="text-xl">🥈</span>}
                                    {idx === 2 && <span className="text-xl">🥉</span>}
                                    {idx > 2 && <span className="text-gray-500">#{idx + 1}</span>}
                                </td>
                                <td className="p-4 text-white font-bold">{entry.username}</td>
                                <td className="p-4 text-center text-gray-400">{entry.levelsCompleted}</td>
                                <td className="p-4 text-center text-gray-500">
                                    {Math.floor(entry.totalTimeTaken / 60)}m {entry.totalTimeTaken % 60}s
                                </td>
                                <td className="p-4 text-right text-primary font-bold">{entry.totalPoints}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {activeTab === 'levels' && (
          <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Challenge Configuration</h2>
                {editingLevel && (
                    <button 
                        onClick={() => {setEditingLevel(null); setNewLevel({levelNumber: '', title: '', question: '', answer: '', clue: '', thresholdTime: 300, maxPoints: 100})}}
                        className="text-xs text-red-400 hover:underline"
                    >
                        Cancel Editing
                    </button>
                )}
            </div>

            {/* ADD/EDIT FORM */}
            <form onSubmit={handleAddLevel} className="glass-card p-6 bg-accent/5 border-accent/20">
              <h3 className="text-sm font-bold uppercase tracking-widest mb-6 flex items-center gap-2 text-accent">
                {editingLevel ? <Edit2 className="w-4 h-4" /> : <PlusCircle className="w-4 h-4" />}
                {editingLevel ? `Modifying Level ${editingLevel.levelNumber}` : 'Initialize New Challenge'}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Level ID</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.levelNumber}
                    onChange={(e) => setNewLevel({...newLevel, levelNumber: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Challenge Designation</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.title}
                    onChange={(e) => setNewLevel({...newLevel, title: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Question Payload (Markdown/HTML supported)</label>
                  <textarea 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none h-24 font-mono text-sm"
                    value={newLevel.question}
                    onChange={(e) => setNewLevel({...newLevel, question: e.target.value})}
                    required
                  ></textarea>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Validation Key (Answer)</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.answer}
                    onChange={(e) => setNewLevel({...newLevel, answer: e.target.value})}
                    required={!editingLevel}
                    placeholder={editingLevel ? "Leave blank to keep hidden" : ""}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Clue Injection</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.clue}
                    onChange={(e) => setNewLevel({...newLevel, clue: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Threshold (Sec)</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.thresholdTime}
                    onChange={(e) => setNewLevel({...newLevel, thresholdTime: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Max Points</label>
                  <input 
                    type="number" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.maxPoints}
                    onChange={(e) => setNewLevel({...newLevel, maxPoints: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] uppercase text-gray-500 font-bold">Evidence Image URL (Optional)</label>
                  <input 
                    type="text" 
                    className="w-full bg-black/60 border border-white/10 rounded p-2 text-white focus:border-accent outline-none font-mono"
                    value={newLevel.imageUrl}
                    onChange={(e) => setNewLevel({...newLevel, imageUrl: e.target.value})}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="flex items-end">
                  <button 
                    type="submit"
                    className="w-full bg-accent text-black py-2 rounded font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    {editingLevel ? 'Commit Changes' : 'Initialize'}
                  </button>
                </div>
              </div>
            </form>

            {/* LEVEL LIST */}
            <div className="space-y-4">
                <h3 className="text-[10px] uppercase text-gray-600 font-bold tracking-[0.3em]">Active Challenges</h3>
                <div className="grid grid-cols-1 gap-3">
                    {levels.map(level => (
                        <div key={level._id} className="glass-card p-4 flex items-center justify-between border-white/5 hover:border-accent/30 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded bg-white/5 flex items-center justify-center font-bold text-accent border border-white/10">
                                    {level.levelNumber}
                                </div>
                                <div>
                                    <div className="text-white font-bold">{level.title}</div>
                                    <div className="text-[10px] text-gray-500 uppercase flex items-center gap-3">
                                        <span>Max: {level.maxPoints} pts</span>
                                        <span className="w-1 h-1 rounded-full bg-gray-700"></span>
                                        <span>Clue @ {level.thresholdTime}s</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button 
                                    onClick={() => startEditLevel(level)}
                                    className="p-2 hover:bg-accent/20 hover:text-accent rounded transition-colors"
                                >
                                    <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                    onClick={() => handleDeleteLevel(level._id)}
                                    className="p-2 hover:bg-red-500/20 hover:text-red-500 rounded transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-gray-700" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
