import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { initDatabase } from './storage/db.js';
import { ensureGifDirectory } from './storage/files.js';
import { registerGifHandlers } from './ipc/gifHandlers.js';
import { registerTagHandlers } from './ipc/tagHandlers.js';

// ES module equivalent of __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;
let isQuitting = false;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  // Hide to tray instead of closing (for background running)
  mainWindow.on('close', (event) => {
    if (!isQuitting) {
      event.preventDefault();
      mainWindow?.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function createSearchPopup() {
  // Reuse main window but trigger search mode
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    mainWindow.webContents.send('open-search-popup');
  } else {
    createWindow();
    // We know mainWindow is set after createWindow(), so we can use non-null assertion
    mainWindow!.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('open-search-popup');
    });
  }
}

function createTray() {
  try {
    // Create a 16x16 transparent icon (required for Linux)
    const icon = nativeImage.createFromBuffer(
      Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAADklEQVQ4jWNgGAWjAAMAAA' +
        'QAAQZEJqUAAAAASUVORK5CYII=',
        'base64'
      )
    );
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      { label: 'Open GIF Stash', click: () => mainWindow?.show() },
      { label: 'Quick Search', accelerator: 'CmdOrCtrl+Shift+G', click: createSearchPopup },
      { type: 'separator' },
      { label: 'Quit', click: () => {
        isQuitting = true;
        app.quit();
      }},
    ]);
    
    tray.setToolTip('GIF Stash');
    tray.setContextMenu(contextMenu);
    
    tray.on('click', () => {
      mainWindow?.show();
    });
  } catch (error) {
    console.error('Failed to create tray:', error);
    // Continue without tray - not critical
  }
}

function registerGlobalShortcuts() {
  try {
    // Global shortcut to open search popup from anywhere
    const registered = globalShortcut.register('CmdOrCtrl+Shift+G', createSearchPopup);
    if (!registered) {
      console.warn('Failed to register global shortcut CmdOrCtrl+Shift+G');
    }
  } catch (error) {
    console.error('Failed to register global shortcuts:', error);
    // Continue without shortcuts - not critical
  }
}

async function initialize() {
  // Ensure storage directories exist
  await ensureGifDirectory();
  
  // Initialize SQLite database
  initDatabase();
  
  // Register IPC handlers
  registerGifHandlers(ipcMain);
  registerTagHandlers(ipcMain);
}

app.whenReady().then(async () => {
  try {
    await initialize();
    createWindow();
    createTray();
    registerGlobalShortcuts();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  } catch (error) {
    console.error('Failed to initialize app:', error);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  // Don't quit - keep running in system tray
  // App will only quit when user clicks "Quit" in tray menu
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
