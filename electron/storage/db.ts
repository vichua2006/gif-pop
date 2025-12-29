import Database from 'better-sqlite3';
import * as path from 'path';
import { app } from 'electron';
import type { GifRow, TagRow, GifTagRow } from '../types';

let db: Database.Database | null = null;

export function getDbPath(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'gif-stash.db');
}

export function getDatabase(): Database.Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
}

export function initDatabase(): void {
  const dbPath = getDbPath();
  db = new Database(dbPath);
  
  // Enable foreign keys
  db.pragma('foreign_keys = ON');
  
  // Create tables
  db.exec(`
    -- Main GIF metadata table
    CREATE TABLE IF NOT EXISTS gifs (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      is_favorite INTEGER DEFAULT 0
    );
    
    -- Tag definitions
    CREATE TABLE IF NOT EXISTS tags (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE
    );
    
    -- Many-to-many relationship
    CREATE TABLE IF NOT EXISTS gif_tags (
      gif_id TEXT NOT NULL,
      tag_id INTEGER NOT NULL,
      PRIMARY KEY (gif_id, tag_id),
      FOREIGN KEY (gif_id) REFERENCES gifs(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    );
    
    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_gifs_created_at ON gifs(created_at DESC);
    CREATE INDEX IF NOT EXISTS idx_gifs_name ON gifs(name);
    CREATE INDEX IF NOT EXISTS idx_gifs_is_favorite ON gifs(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_tags_name ON tags(name);
  `);
  
  console.log('Database initialized at:', dbPath);
}

// GIF operations
export function insertGif(gif: Omit<GifRow, 'is_favorite'> & { is_favorite?: number }): void {
  const stmt = getDatabase().prepare(`
    INSERT INTO gifs (id, name, created_at, is_favorite)
    VALUES (?, ?, ?, ?)
  `);
  stmt.run(gif.id, gif.name, gif.created_at, gif.is_favorite ?? 0);
}

export function getGifById(id: string): GifRow | undefined {
  const stmt = getDatabase().prepare('SELECT * FROM gifs WHERE id = ?');
  return stmt.get(id) as GifRow | undefined;
}

export function getAllGifs(): GifRow[] {
  const stmt = getDatabase().prepare('SELECT * FROM gifs ORDER BY created_at DESC');
  return stmt.all() as GifRow[];
}

export function updateGif(id: string, updates: { name?: string; is_favorite?: number }): void {
  const fields: string[] = [];
  const values: (string | number)[] = [];
  
  if (updates.name !== undefined) {
    fields.push('name = ?');
    values.push(updates.name);
  }
  if (updates.is_favorite !== undefined) {
    fields.push('is_favorite = ?');
    values.push(updates.is_favorite);
  }
  
  if (fields.length === 0) return;
  
  values.push(id);
  const stmt = getDatabase().prepare(`UPDATE gifs SET ${fields.join(', ')} WHERE id = ?`);
  stmt.run(...values);
}

export function deleteGif(id: string): void {
  const stmt = getDatabase().prepare('DELETE FROM gifs WHERE id = ?');
  stmt.run(id);
}

export function searchGifs(query: string): GifRow[] {
  const stmt = getDatabase().prepare(`
    SELECT * FROM gifs 
    WHERE name LIKE ? 
    ORDER BY created_at DESC
  `);
  return stmt.all(`%${query}%`) as GifRow[];
}

// Tag operations
export function insertTag(name: string): TagRow {
  const stmt = getDatabase().prepare('INSERT INTO tags (name) VALUES (?)');
  const result = stmt.run(name);
  return { id: result.lastInsertRowid as number, name };
}

export function getAllTags(): TagRow[] {
  const stmt = getDatabase().prepare('SELECT * FROM tags ORDER BY name');
  return stmt.all() as TagRow[];
}

export function getTagById(id: number): TagRow | undefined {
  const stmt = getDatabase().prepare('SELECT * FROM tags WHERE id = ?');
  return stmt.get(id) as TagRow | undefined;
}

export function updateTag(id: number, name: string): void {
  const stmt = getDatabase().prepare('UPDATE tags SET name = ? WHERE id = ?');
  stmt.run(name, id);
}

export function deleteTag(id: number): void {
  const stmt = getDatabase().prepare('DELETE FROM tags WHERE id = ?');
  stmt.run(id);
}

// GIF-Tag relationship operations
export function addTagToGif(gifId: string, tagId: number): void {
  const stmt = getDatabase().prepare(`
    INSERT OR IGNORE INTO gif_tags (gif_id, tag_id) VALUES (?, ?)
  `);
  stmt.run(gifId, tagId);
}

export function removeTagFromGif(gifId: string, tagId: number): void {
  const stmt = getDatabase().prepare('DELETE FROM gif_tags WHERE gif_id = ? AND tag_id = ?');
  stmt.run(gifId, tagId);
}

export function getTagsForGif(gifId: string): TagRow[] {
  const stmt = getDatabase().prepare(`
    SELECT t.* FROM tags t
    JOIN gif_tags gt ON gt.tag_id = t.id
    WHERE gt.gif_id = ?
    ORDER BY t.name
  `);
  return stmt.all(gifId) as TagRow[];
}

export function getGifIdsByTag(tagId: number): string[] {
  const stmt = getDatabase().prepare('SELECT gif_id FROM gif_tags WHERE tag_id = ?');
  const rows = stmt.all(tagId) as GifTagRow[];
  return rows.map(row => row.gif_id);
}
