class SettingsManager {
  constructor() {
    this.defaultSettings = {
      theme: 'dark',
    };
    
    this.settings = this.loadSettings();
    this.listeners = new Set();
  }

  loadSettings() {
    try {
      const savedSettings = localStorage.getItem('appSettings');
      return savedSettings ? JSON.parse(savedSettings) : this.defaultSettings;
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      return this.defaultSettings;
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('appSettings', JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  }

  get(settingKey) {
    return this.settings[settingKey];
  }

  set(settingKey, value) {
    this.settings[settingKey] = value;
    this.saveSettings();
  }

  reset() {
    this.settings = { ...this.defaultSettings };
    this.saveSettings();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.settings));
  }

  getAllSettings() {
    return { ...this.settings };
  }
}

const settingsManager = new SettingsManager();

export default settingsManager; 