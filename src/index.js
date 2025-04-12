const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

let chokidar;
try {
  chokidar = require('chokidar');
} catch (e) {
  console.log('Chokidar not found, using native fs.watch');
}

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

app.commandLine.appendSwitch('enable-accelerated-mjpeg-decode');
app.commandLine.appendSwitch('enable-accelerated-video');
app.commandLine.appendSwitch('ignore-gpu-blacklist');
app.commandLine.appendSwitch('enable-native-gpu-memory-buffers');

const CSP = [
  "default-src 'self'",
  "img-src 'self' data:",
  "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com",
  "font-src 'self' https://cdnjs.cloudflare.com",
  "script-src 'self' https://cdnjs.cloudflare.com 'unsafe-inline' blob:",
  "worker-src blob:",
  "media-src 'self' blob: data:"
].join(';');

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    minWidth: 1000,
    minHeight: 700,
    icon: path.join(__dirname, 'assets/images/icon.png'),
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true, 
      enableRemoteModule: false, 
      webSecurity: true,
      backgroundThrottling: false
    },
    show: false
  });

  mainWindow.setMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'pages/index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [CSP]
      }
    });
  });

  mainWindow.setTitle('Re:Player');

  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  checkForChanges();
};

const checkForChanges = () => {
  const filesToWatch = [
    path.join(__dirname, 'pages/index.html'),
    path.join(__dirname, 'index.css'),
    path.join(__dirname, 'renderer.js')
  ];

  if (chokidar) {
    try {
      const watcher = chokidar.watch(filesToWatch, {
        ignoreInitial: true,
        persistent: true,
        awaitWriteFinish: {
          stabilityThreshold: 500,
          pollInterval: 100
        }
      });

      watcher.on('change', (file) => {
        console.log(`File ${file} was changed`);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.reload();
        }
      });

      watcher.on('error', (error) => {
        console.error('Watcher error:', error);
      });
    } catch (error) {
      console.error('Failed to start file watcher:', error);
      useFsWatch();
    }
  } else {
    useFsWatch();
  }

  function useFsWatch() {
    filesToWatch.forEach(file => {
      try {
        const watcher = fs.watch(file, (eventType) => {
          if (eventType === 'change') {
            console.log(`File ${file} was changed`);
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.reload();
            }
          }
        });

        watcher.on('error', (error) => {
          console.error(`Error while tracking file ${file}:`, error);
          setTimeout(() => {
            console.log(`Reconnecting to file ${file}...`);
            useFsWatch();
          }, 1000);
        });
      } catch (error) {
        console.error(`Failed to start tracking file ${file}:`, error);
      }
    });
  }
};

const getActiveWindow = () => {
  const win = BrowserWindow.getFocusedWindow();
  if (!win) {
    console.warn('No active window found');
  }
  return win;
};

app.whenReady().then(() => {
  createWindow();

  ipcMain.handle('select-audio-files', async () => {
    try {
      const { canceled, filePaths } = await dialog.showOpenDialog({
        properties: ['openFile', 'multiSelections'],
        filters: [
          { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac'] }
        ]
      });
      
      return canceled ? [] : filePaths;
    } catch (error) {
      console.error('File dialog error:', error);
      return [];
    }
  });

  ipcMain.handle('minimize-window', () => {
    getActiveWindow()?.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    const win = getActiveWindow();
    if (win) {
      const isMaximized = win.isMaximized();
      isMaximized ? win.unmaximize() : win.maximize();
      return !isMaximized;
    }
    return false;
  });

  ipcMain.handle('close-window', () => {
    getActiveWindow()?.close();
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.session.clearCache().then(() => {
        app.quit();
      }).catch(() => {
        app.quit();
      });
    } else {
      app.quit();
    }
  }
});
