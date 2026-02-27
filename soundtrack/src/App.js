import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import LoginPage from './pages/LoginPage';
import TimelinePage from './pages/TimelinePage';
import FavoriteSongsPage from './pages/FavoriteSongsPage';
import FavoriteAlbumsPage from './pages/FavoriteAlbumsPage';
import BrowsePage from './pages/BrowsePage';
import ViewSoundtrackPage from './pages/ViewSoundtrackPage';
import SuperChartPage from './pages/SuperChartPage';
import './App.css';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading...</div>;
  if (!user) return <Navigate to="/" replace />;
  return children;
};

const AppRoutes = () => {
  const { user, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <>
      <Header />
      <main className="main-content">
        <Routes>
          <Route
            path="/"
            element={user ? <Navigate to="/timeline" replace /> : <LoginPage />}
          />
          <Route path="/timeline" element={<ProtectedRoute><TimelinePage /></ProtectedRoute>} />
          <Route path="/favorites/songs" element={<ProtectedRoute><FavoriteSongsPage /></ProtectedRoute>} />
          <Route path="/favorites/albums" element={<ProtectedRoute><FavoriteAlbumsPage /></ProtectedRoute>} />
          <Route path="/browse" element={<ProtectedRoute><BrowsePage /></ProtectedRoute>} />
          <Route path="/user/:userId" element={<ProtectedRoute><ViewSoundtrackPage /></ProtectedRoute>} />
          <Route path="/superchart" element={<ProtectedRoute><SuperChartPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
};

const App = () => (
  <HashRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </HashRouter>
);

export default App;
