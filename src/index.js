const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 800,
    minHeight: 600,
    icon: path.join(__dirname, 'assets/icon.png'),
    frame: false, // Убираем стандартный заголовок окна
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Убираем стандартное меню
  mainWindow.setMenu(null);

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Установка Content Security Policy
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

  
  // Также добавляем горячую клавишу F12 для открытия DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12') {
      mainWindow.webContents.toggleDevTools();
      event.preventDefault();
    }
  });

  // Функция для проверки изменений в файлах
  const checkForChanges = () => {
    const filesToWatch = [
      path.join(__dirname, 'index.html'),
      path.join(__dirname, 'index.css'),
      path.join(__dirname, 'renderer.js')
    ];

    filesToWatch.forEach(file => {
      try {
        const watcher = fs.watch(file, (eventType) => {
          if (eventType === 'change') {
            console.log(`Файл ${file} был изменен`);
            mainWindow.reload();
          }
        });

        watcher.on('error', (error) => {
          console.error(`Ошибка при отслеживании файла ${file}:`, error);
          // Переподключаемся через 1 секунду
          setTimeout(() => {
            console.log(`Переподключение к файлу ${file}...`);
            checkForChanges();
          }, 1000);
        });
      } catch (error) {
        console.error(`Не удалось начать отслеживание файла ${file}:`, error);
      }
    });
  };

  // Запускаем проверку изменений
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
