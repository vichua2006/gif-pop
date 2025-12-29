import type { IpcMain } from 'electron';
import type { GifItemWithTags, CreateGifInput } from '../types';
import * as db from '../storage/db';
import * as files from '../storage/files';

function mapGifRowToGifWithTags(row: db.GifRow): GifItemWithTags {
  const tags = db.getTagsForGif(row.id);
  return {
    id: row.id,
    name: row.name,
    createdAt: row.created_at,
    isFavorite: row.is_favorite === 1,
    tags,
    filePath: files.getGifFileUrl(row.id),
  };
}

export function registerGifHandlers(ipcMain: IpcMain): void {
  // Get all GIFs
  ipcMain.handle('gif:getAll', async (): Promise<GifItemWithTags[]> => {
    const rows = db.getAllGifs();
    return rows.map(mapGifRowToGifWithTags);
  });

  // Get single GIF
  ipcMain.handle('gif:get', async (_, id: string): Promise<GifItemWithTags | null> => {
    const row = db.getGifById(id);
    if (!row) return null;
    return mapGifRowToGifWithTags(row);
  });

  // Add new GIF
  ipcMain.handle('gif:add', async (_, input: CreateGifInput): Promise<GifItemWithTags> => {
    let id: string;
    
    // Determine source type and save file accordingly
    if (input.sourceType === 'file' || !input.sourceData.startsWith('data:')) {
      id = await files.saveGifFromPath(input.sourceData);
    } else {
      id = await files.saveGifFromDataUrl(input.sourceData);
    }
    
    const now = Date.now();
    db.insertGif({
      id,
      name: input.name.trim(),
      created_at: now,
    });
    
    return {
      id,
      name: input.name.trim(),
      createdAt: now,
      isFavorite: false,
      tags: [],
      filePath: files.getGifFileUrl(id),
    };
  });

  // Update GIF
  ipcMain.handle('gif:update', async (_, id: string, updates: { name?: string; isFavorite?: boolean }): Promise<GifItemWithTags> => {
    const dbUpdates: { name?: string; is_favorite?: number } = {};
    
    if (updates.name !== undefined) {
      dbUpdates.name = updates.name.trim();
    }
    if (updates.isFavorite !== undefined) {
      dbUpdates.is_favorite = updates.isFavorite ? 1 : 0;
    }
    
    db.updateGif(id, dbUpdates);
    
    const row = db.getGifById(id);
    if (!row) {
      throw new Error(`GIF not found: ${id}`);
    }
    
    return mapGifRowToGifWithTags(row);
  });

  // Delete GIF
  ipcMain.handle('gif:delete', async (_, id: string): Promise<void> => {
    // Delete file first
    await files.deleteGifFile(id);
    // Then delete from database (cascades to gif_tags)
    db.deleteGif(id);
  });

  // Search GIFs
  ipcMain.handle('gif:search', async (_, query: string): Promise<GifItemWithTags[]> => {
    if (!query.trim()) {
      const rows = db.getAllGifs();
      return rows.map(mapGifRowToGifWithTags);
    }
    const rows = db.searchGifs(query);
    return rows.map(mapGifRowToGifWithTags);
  });

  // Get GIF file path
  ipcMain.handle('gif:getPath', async (_, id: string): Promise<string> => {
    return files.getGifFilePath(id);
  });

  // Add tag to GIF
  ipcMain.handle('gif:addTag', async (_, gifId: string, tagId: number): Promise<void> => {
    db.addTagToGif(gifId, tagId);
  });

  // Remove tag from GIF
  ipcMain.handle('gif:removeTag', async (_, gifId: string, tagId: number): Promise<void> => {
    db.removeTagFromGif(gifId, tagId);
  });

  // Get GIFs by tag
  ipcMain.handle('gif:getByTag', async (_, tagId: number): Promise<GifItemWithTags[]> => {
    const gifIds = db.getGifIdsByTag(tagId);
    return gifIds
      .map(id => db.getGifById(id))
      .filter((row): row is db.GifRow => row !== undefined)
      .map(mapGifRowToGifWithTags);
  });
}
