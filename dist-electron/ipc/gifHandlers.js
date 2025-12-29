import * as db from '../storage/db.js';
import * as files from '../storage/files.js';
function mapGifRowToGifWithTags(row) {
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
export function registerGifHandlers(ipcMain) {
    // Get all GIFs
    ipcMain.handle('gif:getAll', async () => {
        const rows = db.getAllGifs();
        return rows.map(mapGifRowToGifWithTags);
    });
    // Get single GIF
    ipcMain.handle('gif:get', async (_, id) => {
        const row = db.getGifById(id);
        if (!row)
            return null;
        return mapGifRowToGifWithTags(row);
    });
    // Add new GIF
    ipcMain.handle('gif:add', async (_, input) => {
        let id;
        // Determine source type and save file accordingly
        if (input.sourceType === 'file' || !input.sourceData.startsWith('data:')) {
            id = await files.saveGifFromPath(input.sourceData);
        }
        else {
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
    ipcMain.handle('gif:update', async (_, id, updates) => {
        const dbUpdates = {};
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
    ipcMain.handle('gif:delete', async (_, id) => {
        // Delete file first
        await files.deleteGifFile(id);
        // Then delete from database (cascades to gif_tags)
        db.deleteGif(id);
    });
    // Search GIFs
    ipcMain.handle('gif:search', async (_, query) => {
        if (!query.trim()) {
            const rows = db.getAllGifs();
            return rows.map(mapGifRowToGifWithTags);
        }
        const rows = db.searchGifs(query);
        return rows.map(mapGifRowToGifWithTags);
    });
    // Get GIF file path
    ipcMain.handle('gif:getPath', async (_, id) => {
        return files.getGifFilePath(id);
    });
    // Add tag to GIF
    ipcMain.handle('gif:addTag', async (_, gifId, tagId) => {
        db.addTagToGif(gifId, tagId);
    });
    // Remove tag from GIF
    ipcMain.handle('gif:removeTag', async (_, gifId, tagId) => {
        db.removeTagFromGif(gifId, tagId);
    });
    // Get GIFs by tag
    ipcMain.handle('gif:getByTag', async (_, tagId) => {
        const gifIds = db.getGifIdsByTag(tagId);
        return gifIds
            .map(id => db.getGifById(id))
            .filter((row) => row !== undefined)
            .map(mapGifRowToGifWithTags);
    });
}
