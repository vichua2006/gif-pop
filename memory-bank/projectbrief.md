# Project Brief: GIF Pop

## Overview
GIF Pop is a lightweight Electron desktop app for managing a personal GIF/image collection with quick search and paste functionality.

## Core Requirements
1. **Local Collection Management** - Add/organize GIFs, JPGs, PNGs with custom names
2. **Global Hotkey Search** - `Ctrl+Shift+G` (Win/Linux) / `Cmd+Shift+G` (Mac) for instant search popup
3. **Clipboard Paste** - Copy selected image to clipboard for pasting anywhere (Windows & macOS only)
4. **Fully Offline** - All data stored locally (SQLite metadata + filesystem for files)
5. **System Tray** - Background running with tray icon

## Original Use Case
Enable using [WeChat Stickers](https://sticker.weixin.qq.com/cgi-bin/mmemoticonwebnode-bin/pages/home) in other messaging apps.

## Target Platforms
- Windows (primary)
- macOS
- Linux (limited - no clipboard paste)
