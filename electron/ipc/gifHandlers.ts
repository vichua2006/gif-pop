import type { IpcMain } from 'electron';
import { clipboard, nativeImage } from 'electron';
import type { GifItemWithTags, CreateGifInput, GifRow } from '../types.js';
import * as db from '../storage/db.js';
import * as files from '../storage/files.js';
import * as fs from 'fs';
import { exec } from 'child_process';

function mapGifRowToGifWithTags(row: GifRow): GifItemWithTags {
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
    console.log('gif:add called with:', { name: input.name, sourceType: input.sourceType, dataLength: input.sourceData?.length });
    
    try {
      let id: string;
      
      // Determine source type and save file accordingly
      if (input.sourceType === 'file' || !input.sourceData.startsWith('data:')) {
        console.log('Saving from file path...');
        id = await files.saveGifFromPath(input.sourceData);
      } else {
        console.log('Saving from data URL...');
        id = await files.saveGifFromDataUrl(input.sourceData);
      }
      
      console.log('File saved with id:', id);
      
      const now = Date.now();
      db.insertGif({
        id,
        name: input.name.trim(),
        created_at: now,
      });
      
      console.log('Database entry created');
      
      const result = {
        id,
        name: input.name.trim(),
        createdAt: now,
        isFavorite: false,
        tags: [],
        filePath: files.getGifFileUrl(id),
      };
      
      console.log('Returning:', result);
      return result;
    } catch (error) {
      console.error('Error in gif:add:', error);
      throw error;
    }
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

  // Copy GIF to clipboard using native Electron clipboard
  ipcMain.handle('gif:copyToClipboard', async (_, id: string): Promise<{ success: boolean; method: string }> => {
    const filePath = files.getGifFilePath(id);
    
    try {
      // On Windows, use PowerShell to copy the file to clipboard (like Ctrl+C on a file)
      if (process.platform === 'win32') {
        return new Promise((resolve, reject) => {
          // PowerShell command to copy file to clipboard - use single quotes for path with spaces
          const psCommand = `Set-Clipboard -Path '${filePath.replace(/'/g, "''")}'`;
          exec(`powershell -command "${psCommand}"`, (error) => {
            if (error) {
              console.error('PowerShell copy failed:', error);
              // Fallback to image copy
              const imageBuffer = fs.readFileSync(filePath);
              const image = nativeImage.createFromBuffer(imageBuffer);
              if (!image.isEmpty()) {
                clipboard.writeImage(image);
                resolve({ success: true, method: 'image' });
              } else {
                reject(error);
              }
            } else {
              console.log('File copied to clipboard via PowerShell');
              resolve({ success: true, method: 'file' });
            }
          });
        });
      }
      
      // On other platforms, fall back to image copy
      const imageBuffer = fs.readFileSync(filePath);
      const image = nativeImage.createFromBuffer(imageBuffer);
      
      if (!image.isEmpty()) {
        clipboard.writeImage(image);
        return { success: true, method: 'image' };
      }
      
      // Last resort: write the file path as text
      clipboard.writeText(filePath);
      return { success: true, method: 'path' };
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      throw error;
    }
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
      .filter((row): row is GifRow => row !== undefined)
      .map(mapGifRowToGifWithTags);
  });
}
