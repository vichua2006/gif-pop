# Active Context: GIF Pop

## Current State
Project is functional with core features implemented:
- Main window with GIF grid display
- Add GIF dialog
- Search popup with global hotkey
- System tray integration
- SQLite + filesystem storage

## Recent Focus
Memory bank initialization (this session).

## Next Steps
- Awaiting user direction for next feature/fix

## Active Decisions
- Using `preload.cjs` (CommonJS) for Electron preload script compatibility
- Frameless windows with custom `TitleBar.tsx` component
- Closes to tray rather than quitting (background persistence)

## Known Considerations
- Clipboard paste only works on Windows & macOS
- Global shortcut may conflict with other apps using same combo
