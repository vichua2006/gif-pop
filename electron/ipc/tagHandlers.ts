import type { IpcMain } from 'electron';
import type { TagItem } from '../types';
import * as db from '../storage/db';

export function registerTagHandlers(ipcMain: IpcMain): void {
  // Get all tags
  ipcMain.handle('tag:getAll', async (): Promise<TagItem[]> => {
    return db.getAllTags();
  });

  // Create tag
  ipcMain.handle('tag:create', async (_, name: string): Promise<TagItem> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Tag name cannot be empty');
    }
    return db.insertTag(trimmedName);
  });

  // Update tag
  ipcMain.handle('tag:update', async (_, id: number, name: string): Promise<TagItem> => {
    const trimmedName = name.trim();
    if (!trimmedName) {
      throw new Error('Tag name cannot be empty');
    }
    
    db.updateTag(id, trimmedName);
    
    const tag = db.getTagById(id);
    if (!tag) {
      throw new Error(`Tag not found: ${id}`);
    }
    
    return tag;
  });

  // Delete tag
  ipcMain.handle('tag:delete', async (_, id: number): Promise<void> => {
    db.deleteTag(id);
  });
}
