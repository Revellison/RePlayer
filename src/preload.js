// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const { contextBridge, ipcRenderer } = require('electron');

// Экспорт API для работы с основным процессом
contextBridge.exposeInMainWorld('electronAPI', {
  // Функция для выбора аудио файлов
  selectAudioFiles: () => ipcRenderer.invoke('select-audio-files'),
  
  // Другие функции, которые могут быть полезны
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  
  // Сохранение и загрузка настроек плеера
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  loadSettings: () => ipcRenderer.invoke('load-settings'),
  
  // Управление окном
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  maximizeWindow: () => ipcRenderer.invoke('maximize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
});
