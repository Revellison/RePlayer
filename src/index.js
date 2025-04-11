const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

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
    },
  });

  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'pages/index.html'));

  //content security policy
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self';" +
          "img-src 'self' data:;" +
          "style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com;" +
          "font-src 'self' https://cdnjs.cloudflare.com;"
        ]
      }
    });
  });

  // Установка заголовка окна
  mainWindow.setTitle('Re:Player');

  
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  const checkForChanges = () => {
    const filesToWatch = [
      path.join(__dirname, 'pages/index.html'),
      path.join(__dirname, 'index.css'),
      path.join(__dirname, 'renderer.js')
    ];

    filesToWatch.forEach(file => {
      try {
        const watcher = fs.watch(file, (eventType) => {
          if (eventType === 'change') {
            console.log(`File ${file} was changed`);
            mainWindow.reload();
          }
        });

        watcher.on('error', (error) => {
          console.error(`Error while tracking file ${file}:`, error);
          setTimeout(() => {
            console.log(`Reconnecting to file ${file}...`);
            checkForChanges();
          }, 1000);
        });
      } catch (error) {
        console.error(`Failed to start tracking file ${file}:`, error);
      }
    });
  };

  checkForChanges();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  // Обработчик выбора аудиофайла
  ipcMain.handle('select-audio-files', async () => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav', 'ogg', 'flac'] }
      ]
    });
    
    if (!canceled) {
      return filePaths;
    }
    return [];
  });

  // Обработчики для управления окном
  ipcMain.handle('minimize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.minimize();
  });

  ipcMain.handle('maximize-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize();
        return false;
      } else {
        win.maximize();
        return true;
      }
    }
    return false;
  });

  ipcMain.handle('close-window', () => {
    const win = BrowserWindow.getFocusedWindow();
    if (win) win.close();
  });

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
