import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import PlayerFooter from './components/footer/footer';
import Home from './pages/Home'
import Playlists from './pages/Playlists'
import Settings from './pages/Settings'
import './App.css'
import Favorites from './pages/favorites'
import settingsManager from './utils/settingsManager'

const App = () => {
  useEffect(() => {
    const currentTheme = settingsManager.get('theme');
    document.documentElement.setAttribute('data-theme', currentTheme);
  }, []);

  return (
    <Router>
      <div className="app">
        <Sidebar />
        <PlayerFooter/>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/playlists" element={<Playlists />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App