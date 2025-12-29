import { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { initDatabase } from './storage/db';
import { ensureGifDirectory } from './storage/files';
import { registerGifHandlers } from './ipc/gifHandlers';
import { registerTagHandlers } from './ipc/tagHandlers';

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
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
    mainWindow?.webContents.once('did-finish-load', () => {
      mainWindow?.webContents.send('open-search-popup');
    });
  }
}

function createTray() {
  // Create a simple tray icon (you can replace with actual icon)
  const icon = nativeImage.createEmpty();
  tray = new Tray(icon);
  
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open GIF Stash', click: () => mainWindow?.show() },
    { label: 'Quick Search', accelerator: 'CmdOrCtrl+Shift+G', click: createSearchPopup },
    { type: 'separator' },
    { label: 'Quit', click: () => app.quit() },
  ]);
  
  tray.setToolTip('GIF Stash');
  tray.setContextMenu(contextMenu);
  
  tray.on('click', () => {
    mainWindow?.show();
  });
}

function registerGlobalShortcuts() {
  // Global shortcut to open search popup from anywhere
  globalShortcut.register('CmdOrCtrl+Shift+G', createSearchPopup);
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
  await initialize();
  createWindow();
  createTray();
  registerGlobalShortcuts();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});
