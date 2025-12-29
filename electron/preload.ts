import { contextBridge, ipcRenderer } from 'electron';
import type { GifItemWithTags, TagItem, CreateGifInput } from './types';

// Expose protected methods to the renderer process
contextBridge.exposeInMainWorld('api', {
  // GIF operations
  getGifs: (): Promise<GifItemWithTags[]> => 
    ipcRenderer.invoke('gif:getAll'),
  
  getGif: (id: string): Promise<GifItemWithTags | null> => 
    ipcRenderer.invoke('gif:get', id),
  
  addGif: (input: CreateGifInput): Promise<GifItemWithTags> => 
    ipcRenderer.invoke('gif:add', input),
  
  updateGif: (id: string, updates: { name?: string; isFavorite?: boolean }): Promise<GifItemWithTags> => 
    ipcRenderer.invoke('gif:update', id, updates),
  
  deleteGif: (id: string): Promise<void> => 
    ipcRenderer.invoke('gif:delete', id),
  
  searchGifs: (query: string): Promise<GifItemWithTags[]> => 
    ipcRenderer.invoke('gif:search', query),
  
  getGifPath: (id: string): Promise<string> => 
    ipcRenderer.invoke('gif:getPath', id),
  
  // Tag operations
  getTags: (): Promise<TagItem[]> => 
    ipcRenderer.invoke('tag:getAll'),
  
  createTag: (name: string): Promise<TagItem> => 
    ipcRenderer.invoke('tag:create', name),
  
  updateTag: (id: number, name: string): Promise<TagItem> => 
    ipcRenderer.invoke('tag:update', id, name),
  
  deleteTag: (id: number): Promise<void> => 
    ipcRenderer.invoke('tag:delete', id),
  
  addTagToGif: (gifId: string, tagId: number): Promise<void> => 
    ipcRenderer.invoke('gif:addTag', gifId, tagId),
  
  removeTagFromGif: (gifId: string, tagId: number): Promise<void> => 
    ipcRenderer.invoke('gif:removeTag', gifId, tagId),
  
  getGifsByTag: (tagId: number): Promise<GifItemWithTags[]> => 
    ipcRenderer.invoke('gif:getByTag', tagId),
  
  // Event listeners
  onOpenSearchPopup: (callback: () => void) => {
    ipcRenderer.on('open-search-popup', callback);
    return () => ipcRenderer.removeListener('open-search-popup', callback);
  },
});

// Type declaration for the renderer process
declare global {
  interface Window {
    api: {
      // GIF operations
      getGifs: () => Promise<GifItemWithTags[]>;
      getGif: (id: string) => Promise<GifItemWithTags | null>;
      addGif: (input: CreateGifInput) => Promise<GifItemWithTags>;
      updateGif: (id: string, updates: { name?: string; isFavorite?: boolean }) => Promise<GifItemWithTags>;
      deleteGif: (id: string) => Promise<void>;
      searchGifs: (query: string) => Promise<GifItemWithTags[]>;
      getGifPath: (id: string) => Promise<string>;
      
      // Tag operations
      getTags: () => Promise<TagItem[]>;
      createTag: (name: string) => Promise<TagItem>;
      updateTag: (id: number, name: string) => Promise<TagItem>;
      deleteTag: (id: number) => Promise<void>;
      addTagToGif: (gifId: string, tagId: number) => Promise<void>;
      removeTagFromGif: (gifId: string, tagId: number) => Promise<void>;
      getGifsByTag: (tagId: number) => Promise<GifItemWithTags[]>;
      
      // Events
      onOpenSearchPopup: (callback: () => void) => () => void;
    };
  }
}
