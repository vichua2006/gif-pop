# GIF Stash - Electron Setup

This project includes an Electron scaffold for running as a native desktop app with file system storage and SQLite.

## Prerequisites

You'll need to install additional dependencies for Electron:

```bash
npm install electron electron-builder better-sqlite3 --save-dev
npm install @types/better-sqlite3 --save-dev
```

## Project Structure

```
electron/
├── main.ts          # Main process entry point
├── preload.ts       # Secure bridge to renderer
├── types.ts         # Shared TypeScript types
├── storage/
│   ├── db.ts        # SQLite database operations
│   └── files.ts     # File system utilities
└── ipc/
    ├── gifHandlers.ts   # IPC handlers for GIF operations
    └── tagHandlers.ts   # IPC handlers for tag operations
```

## Data Storage

- **GIF files**: `~/.gif-stash/gifs/{uuid}.gif` (or your OS equivalent userData path)
- **Metadata**: `~/.gif-stash/gif-stash.db` (SQLite database)

## Building

Add these scripts to your `package.json`:

```json
{
  "main": "dist-electron/main.js",
  "scripts": {
    "electron:dev": "vite build && electron .",
    "electron:build": "vite build && electron-builder"
  },
  "build": {
    "appId": "com.gifstash.app",
    "productName": "GIF Stash",
    "files": [
      "dist/**/*",
      "dist-electron/**/*"
    ],
    "directories": {
      "output": "release"
    }
  }
}
```

## Features

- **Global shortcut**: `Cmd+Shift+G` (Mac) or `Ctrl+Shift+G` (Windows/Linux) opens the search popup from anywhere
- **System tray**: Quick access to the app
- **File storage**: GIFs stored as actual files, not base64 in localStorage
- **SQLite metadata**: Tags, favorites, and GIF names stored in a local database
- **Migration support**: Can import existing localStorage GIFs via data URL

## Usage in React

```tsx
import { useElectronGifCollection } from '@/hooks/useElectronGifCollection';

function MyComponent() {
  const { 
    gifs, 
    tags,
    isElectron,
    addGif, 
    createTag,
    addTagToGif,
    toggleFavorite 
  } = useElectronGifCollection();

  if (!isElectron) {
    return <div>Running in browser mode - Electron features unavailable</div>;
  }

  // ... your component logic
}
```
