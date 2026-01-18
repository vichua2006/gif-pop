# Tech Context: GIF Pop

## Stack
- **Runtime**: Electron 39.x
- **Frontend**: React 18.x + TypeScript 5.x + Vite 5.x
- **Styling**: TailwindCSS 3.x + shadcn/ui (Radix primitives)
- **State**: TanStack Query 5.x
- **Storage**: SQLite (metadata) + Filesystem (image files)

## Project Structure
```
electron/           # Main process
├── main.ts         # Entry, windows, tray, shortcuts
├── preload.cjs     # IPC bridge
├── storage/
│   ├── db.ts       # SQLite operations
│   └── files.ts    # File system utilities
└── ipc/
    ├── gifHandlers.ts
    └── tagHandlers.ts
src/                # Renderer (React)
├── components/     # UI components + shadcn/ui
├── hooks/          # useElectronGifCollection, useGifCollection
├── pages/          # Index, SearchPopupPage, NotFound
└── types/          # TypeScript definitions
```

## Data Storage Paths
- GIF files: `~/.gif-stash/gifs/{uuid}.{ext}`
- Database: `~/.gif-stash/gif-stash.db`

## Key Commands
```bash
npm run dev              # Vite dev server (web only)
npm run electron:dev     # Full Electron dev build
npm run electron:build   # Production build
```

## Dependencies of Note
- `cmdk` - Command palette (search)
- `sonner` - Toast notifications
- `lucide-react` - Icons
