# Active Context: GIF Pop

## Current State
Project is functional with core features implemented:
- Main window with GIF grid display
- Add GIF dialog
- Search popup with global hotkey (Ctrl+Shift+G)
- System tray integration
- SQLite + filesystem storage
- 4-directional arrow key navigation in search popup

## Recent Focus
Improved keyboard navigation in search popup (Jan 2026):
- Added support for all 4 arrow keys (←↑↓→) instead of just ↑↓
- Arrow keys now move intuitively in the 4-column grid layout
- Navigation wraps cyclically (last→first, first→last)
- Handles partial last rows by jumping to last item when target column doesn't exist
- Updated both `SearchPopupPage.tsx` and `SearchPopup.tsx`

## Next Steps
- Awaiting user direction for next feature/fix

## Active Decisions
- Using `preload.cjs` (CommonJS) for Electron preload script compatibility
- Frameless windows with custom `TitleBar.tsx` component
- Closes to tray rather than quitting (background persistence)
- Grid navigation uses COLUMNS=4 constant for maintainability

## Known Considerations
- Clipboard paste only works on Windows & macOS
- Global shortcut may conflict with other apps using same combo
