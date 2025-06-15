import React, { useEffect, useState } from 'react';
import settingsManager from '../utils/settingsManager';

const ThemeSwitch = () => {
  const [isDark, setIsDark] = useState(settingsManager.get('theme') === 'dark');

  useEffect(() => {
    const unsubscribe = settingsManager.subscribe((settings) => {
      setIsDark(settings.theme === 'dark');
      document.documentElement.setAttribute('data-theme', settings.theme);
    });

    document.documentElement.setAttribute('data-theme', settingsManager.get('theme'));

    return () => unsubscribe();
  }, []);

  return (
    <div className="theme-switch-wrapper">
      <input
        type="checkbox"
        checked={isDark}
        readOnly
      />
      <span className="slider"></span>
    </div>
  );
};

export default ThemeSwitch; 