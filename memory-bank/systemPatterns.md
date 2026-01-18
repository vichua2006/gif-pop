# System Patterns: GIF Pop

## Architecture
```
┌─────────────────────────────────────────────┐
│           Electron Main Process             │
│  ┌─────────┐ ┌─────────┐ ┌───────────────┐ │
│  │  Tray   │ │ Hotkey  │ │   IPC Bridge  │ │
│  └─────────┘ └─────────┘ └───────────────┘ │
│                              ↕              │
│  ┌─────────────────────────────────────┐   │
│  │      Storage Layer                  │   │
│  │   SQLite (meta) + FS (files)        │   │
│  └─────────────────────────────────────┘   │
└─────────────────────────────────────────────┘
                    ↕ IPC
┌─────────────────────────────────────────────┐
│         Renderer Process (React)            │
│  ┌──────────┐  ┌──────────────────────┐    │
│  │ Main Win │  │ Search Popup Window  │    │
│  └──────────┘  └──────────────────────┘    │
└─────────────────────────────────────────────┘
```

## Key Patterns

### IPC Communication
- `contextIsolation: true` + `preload.cjs` for security
- Handlers in `electron/ipc/` register via `ipcMain.handle()`
- Renderer calls via `window.electronAPI.{method}()`

### Window Management
- **Main Window**: Frameless, hides to tray on close
- **Search Popup**: Frameless, transparent, always-on-top, closes on blur

### Data Flow
1. React hook (`useElectronGifCollection`) detects Electron environment
2. Calls `window.electronAPI` methods
3. Main process handles via IPC → SQLite/FS operations
4. Returns data to renderer

### Component Patterns
- shadcn/ui components in `src/components/ui/`
- Custom components at `src/components/` level
- Hooks abstract Electron vs browser differences

### Grid Navigation Pattern
Search popup uses a 4-column grid with keyboard navigation:
- `COLUMNS = 4` constant defines grid width
- Arrow keys move intuitively (←→ horizontal, ↑↓ vertical)
- Navigation wraps cyclically at boundaries
- Partial last rows handled by jumping to last item
- Pattern implemented in both `SearchPopupPage.tsx` and `SearchPopup.tsx`
