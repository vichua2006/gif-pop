import * as db from '../storage/db.js';
export function registerTagHandlers(ipcMain) {
    // Get all tags
    ipcMain.handle('tag:getAll', async () => {
        return db.getAllTags();
    });
    // Create tag
    ipcMain.handle('tag:create', async (_, name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
            throw new Error('Tag name cannot be empty');
        }
        return db.insertTag(trimmedName);
    });
    // Update tag
    ipcMain.handle('tag:update', async (_, id, name) => {
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
    ipcMain.handle('tag:delete', async (_, id) => {
        db.deleteTag(id);
    });
}
