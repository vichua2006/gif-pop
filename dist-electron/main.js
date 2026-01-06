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
let mainWindow = null;
let searchWindow = null;
let tray = null;
let isQuitting = false;
const isDev = process.env.NODE_ENV === 'development';
function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        show: false,
        frame: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    }
    else {
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
    // If search window already exists, just focus it
    if (searchWindow && !searchWindow.isDestroyed()) {
        searchWindow.focus();
        return;
    }
    // Create a dedicated frameless popup window for quick search
    searchWindow = new BrowserWindow({
        width: 420,
        height: 340,
        frame: false,
        transparent: true,
        resizable: false,
        alwaysOnTop: true,
        skipTaskbar: true,
        show: false,
        webPreferences: {
            preload: path.join(__dirname, 'preload.cjs'),
            contextIsolation: true,
            nodeIntegration: false,
        },
    });
    // Load the same app but with a hash route for search mode
    if (isDev) {
        searchWindow.loadURL('http://localhost:5173/#/search-popup');
    }
    else {
        searchWindow.loadFile(path.join(__dirname, '../dist/index.html'), {
            hash: '/search-popup'
        });
    }
    searchWindow.once('ready-to-show', () => {
        searchWindow?.show();
        searchWindow?.focus();
    });
    // Close on blur (when clicking outside)
    searchWindow.on('blur', () => {
        searchWindow?.close();
    });
    searchWindow.on('closed', () => {
        searchWindow = null;
    });
}
function createTray() {
    try {
        // Create a 16x16 transparent icon (required for Linux)
        const icon = nativeImage.createFromBuffer(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAADklEQVQ4jWNgGAWjAAMAAA' +
            'QAAQZEJqUAAAAASUVORK5CYII=', 'base64'));
        tray = new Tray(icon);
        const contextMenu = Menu.buildFromTemplate([
            { label: 'Open GIF Stash', click: () => mainWindow?.show() },
            { label: 'Quick Search', accelerator: 'CmdOrCtrl+Shift+G', click: createSearchPopup },
            { type: 'separator' },
            { label: 'Quit', click: () => {
                    isQuitting = true;
                    app.quit();
                } },
        ]);
        tray.setToolTip('GIF Stash');
        tray.setContextMenu(contextMenu);
        tray.on('click', () => {
            mainWindow?.show();
        });
    }
    catch (error) {
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
    }
    catch (error) {
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
    // Window control handlers
    ipcMain.handle('window:close', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (!win)
            return;
        // For main window, hide to tray instead of closing
        if (win === mainWindow && !isQuitting) {
            win.hide();
        }
        else {
            win.close();
        }
    });
    ipcMain.handle('window:minimize', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        win?.minimize();
    });
    ipcMain.handle('window:maximize', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        if (win?.isMaximized()) {
            win.unmaximize();
        }
        else {
            win?.maximize();
        }
    });
    ipcMain.handle('window:isMaximized', (event) => {
        const win = BrowserWindow.fromWebContents(event.sender);
        return win?.isMaximized() ?? false;
    });
    // App quit handler
    ipcMain.handle('window:quit', () => {
        isQuitting = true;
        app.quit();
    });
}
app.whenReady().then(async () => {
    try {
        // Remove menu bar
        Menu.setApplicationMenu(null);
        await initialize();
        createWindow();
        createTray();
        registerGlobalShortcuts();
        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    }
    catch (error) {
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
