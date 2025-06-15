import React from 'react';
import ThemeSwitch from '../components/ThemeSwitch';
import settingsManager from '../utils/settingsManager';
import './styles/settings.css';

const Settings = () => {
  const handleThemeClick = () => {
    const currentTheme = settingsManager.get('theme');
    settingsManager.set('theme', currentTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <div className="page">
      <div className="settings-section">
        <div className="theme-setting" onClick={handleThemeClick}>
          <span>Темная тема</span>
          <ThemeSwitch />
        </div>
      </div>
    </div>
  );
};

export default Settings; 