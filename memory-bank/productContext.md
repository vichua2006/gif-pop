# Product Context: GIF Pop

## Problem Statement
Users collect GIFs/stickers from various sources (especially WeChat) but can't easily use them in other messaging apps. Standard image pickers don't support custom collections with quick search.

## Solution
A lightweight desktop app that:
- Stores images locally with custom searchable names
- Provides instant access via global hotkey from any app
- Copies selected image to clipboard for immediate paste

## User Experience Goals
1. **Speed** - Global hotkey → search → click → paste in under 3 seconds
2. **Simplicity** - Minimal UI, focus on search and grid display
3. **Persistence** - Runs in background, always ready
4. **Organization** - Tags and custom names for easy retrieval

## Key User Flows
1. **Add GIF**: Open app → Add button → Select file → Name it → Save
2. **Quick Paste**: Press hotkey → Type to search → Click GIF → Paste in target app
3. **Browse Collection**: Open main window → Scroll grid → Click to copy
