import * as path from 'path';
import * as fs from 'fs';
import { app } from 'electron';
import type { GifRow, TagRow, GifTagRow } from '../types';

// Simple JSON-based storage (no native compilation needed)
interface DatabaseSchema {
  gifs: GifRow[];
  tags: TagRow[];
  gifTags: GifTagRow[];
  nextTagId: number;
}

let data: DatabaseSchema = {
  gifs: [],
  tags: [],
  gifTags: [],
  nextTagId: 1
};

let dbPath: string = '';

export function getDbPath(): string {
  if (!dbPath) {
    const userDataPath = app.getPath('userData');
    dbPath = path.join(userDataPath, 'gif-stash.json');
  }
  return dbPath;
}

function saveDatabase(): void {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2), 'utf-8');
}

function loadDatabase(): void {
  const filePath = getDbPath();
  if (fs.existsSync(filePath)) {
    try {
      const raw = fs.readFileSync(filePath, 'utf-8');
      data = JSON.parse(raw);
    } catch (e) {
      console.error('Failed to load database, starting fresh:', e);
      data = { gifs: [], tags: [], gifTags: [], nextTagId: 1 };
    }
  }
}

export function initDatabase(): void {
  loadDatabase();
  console.log('Database initialized at:', getDbPath());
}

// GIF operations
export function insertGif(gif: Omit<GifRow, 'is_favorite'> & { is_favorite?: number }): void {
  data.gifs.push({
    id: gif.id,
    name: gif.name,
    created_at: gif.created_at,
    is_favorite: gif.is_favorite ?? 0
  });
  saveDatabase();
}

export function getGifById(id: string): GifRow | undefined {
  return data.gifs.find(g => g.id === id);
}

export function getAllGifs(): GifRow[] {
  return [...data.gifs].sort((a, b) => b.created_at - a.created_at);
}

export function updateGif(id: string, updates: { name?: string; is_favorite?: number }): void {
  const gif = data.gifs.find(g => g.id === id);
  if (gif) {
    if (updates.name !== undefined) gif.name = updates.name;
    if (updates.is_favorite !== undefined) gif.is_favorite = updates.is_favorite;
    saveDatabase();
  }
}

export function deleteGif(id: string): void {
  data.gifs = data.gifs.filter(g => g.id !== id);
  data.gifTags = data.gifTags.filter(gt => gt.gif_id !== id);
  saveDatabase();
}

export function searchGifs(query: string): GifRow[] {
  const lowerQuery = query.toLowerCase();
  return data.gifs
    .filter(g => g.name.toLowerCase().includes(lowerQuery))
    .sort((a, b) => b.created_at - a.created_at);
}

// Tag operations
export function insertTag(name: string): TagRow {
  const tag: TagRow = { id: data.nextTagId++, name };
  data.tags.push(tag);
  saveDatabase();
  return tag;
}

export function getAllTags(): TagRow[] {
  return [...data.tags].sort((a, b) => a.name.localeCompare(b.name));
}

export function getTagById(id: number): TagRow | undefined {
  return data.tags.find(t => t.id === id);
}

export function updateTag(id: number, name: string): void {
  const tag = data.tags.find(t => t.id === id);
  if (tag) {
    tag.name = name;
    saveDatabase();
  }
}

export function deleteTag(id: number): void {
  data.tags = data.tags.filter(t => t.id !== id);
  data.gifTags = data.gifTags.filter(gt => gt.tag_id !== id);
  saveDatabase();
}

// GIF-Tag relationship operations
export function addTagToGif(gifId: string, tagId: number): void {
  const exists = data.gifTags.some(gt => gt.gif_id === gifId && gt.tag_id === tagId);
  if (!exists) {
    data.gifTags.push({ gif_id: gifId, tag_id: tagId });
    saveDatabase();
  }
}

export function removeTagFromGif(gifId: string, tagId: number): void {
  data.gifTags = data.gifTags.filter(gt => !(gt.gif_id === gifId && gt.tag_id === tagId));
  saveDatabase();
}

export function getTagsForGif(gifId: string): TagRow[] {
  const tagIds = data.gifTags.filter(gt => gt.gif_id === gifId).map(gt => gt.tag_id);
  return data.tags.filter(t => tagIds.includes(t.id)).sort((a, b) => a.name.localeCompare(b.name));
}

export function getGifIdsByTag(tagId: number): string[] {
  return data.gifTags.filter(gt => gt.tag_id === tagId).map(gt => gt.gif_id);
}
