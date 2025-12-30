const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('api', {
  // GIF operations
  getGifs: () => ipcRenderer.invoke('gif:getAll'),
  getGif: (id) => ipcRenderer.invoke('gif:get', id),
  addGif: (input) => ipcRenderer.invoke('gif:add', input),
  updateGif: (id, updates) => ipcRenderer.invoke('gif:update', id, updates),
  deleteGif: (id) => ipcRenderer.invoke('gif:delete', id),
  searchGifs: (query) => ipcRenderer.invoke('gif:search', query),
  getGifPath: (id) => ipcRenderer.invoke('gif:getPath', id),
  copyGifToClipboard: (id) => ipcRenderer.invoke('gif:copyToClipboard', id),
  
  // Tag operations
  getTags: () => ipcRenderer.invoke('tag:getAll'),
  createTag: (name) => ipcRenderer.invoke('tag:create', name),
  updateTag: (id, name) => ipcRenderer.invoke('tag:update', id, name),
  deleteTag: (id) => ipcRenderer.invoke('tag:delete', id),
  addTagToGif: (gifId, tagId) => ipcRenderer.invoke('gif:addTag', gifId, tagId),
  removeTagFromGif: (gifId, tagId) => ipcRenderer.invoke('gif:removeTag', gifId, tagId),
  getGifsByTag: (tagId) => ipcRenderer.invoke('gif:getByTag', tagId),
  
  // Event listeners
  onOpenSearchPopup: (callback) => {
    ipcRenderer.on('open-search-popup', callback);
    return () => ipcRenderer.removeListener('open-search-popup', callback);
  },
});

