import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
// We will create these pages next
import Landing from './pages/Landing';
import Signup from './pages/Signup';
import Login from './pages/Login';
import SignupPuzzle from './pages/SignupPuzzle';
import Dashboard from './pages/Dashboard';
import Level from './pages/Level';
import Leaderboard from './pages/Leaderboard';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';

// Protected Route Component
const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center text-primary glow-text text-2xl">Loading System...</div>;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // If user signed up but didn't solve puzzle, redirect to puzzle
  // Except if they are actually trying to access the puzzle page
  if (!user.puzzleSolved && window.location.pathname !== '/init-puzzle') {
    return <Navigate to="/init-puzzle" replace />;
  }

  return children;
};

// Puzzle Route Protection
const PuzzleRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;
    
    // If not logged in at all, go to signup
    if (!user) return <Navigate to="/signup" replace />;

    // If already solved, skip to dashboard
    if (user.puzzleSolved) return <Navigate to="/dashboard" replace />;

    return children;
};

// Unauthenticated Only (Login/Signup)
const GuestRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Loading...</div>;

    if (user) {
        if (!user.puzzleSolved) return <Navigate to="/init-puzzle" replace />;
        return <Navigate to="/dashboard" replace />;
    }
    return children;
};


function App() {
  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            <Route path="/" element={<GuestRoute><Landing /></GuestRoute>} />
            <Route path="/signup" element={<GuestRoute><Signup /></GuestRoute>} />
            <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
            
            <Route path="/init-puzzle" element={
              <PuzzleRoute>
                <SignupPuzzle />
              </PuzzleRoute>
            } />
            
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="/level" element={
              <ProtectedRoute>
                <Level />
              </ProtectedRoute>
            } />
            
            <Route path="/leaderboard" element={<Leaderboard />} />
            
            <Route path="/admin" element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
