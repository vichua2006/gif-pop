import { useState, useEffect, useCallback } from 'react';
import type { GifItemWithTags, TagItem, CreateGifInput } from '../../electron/types';
import '@/types/electron.d';

// Check if we're running in Electron
const isElectron = typeof window !== 'undefined' && 'api' in window && window.api !== undefined;

export function useElectronGifCollection() {
  const [gifs, setGifs] = useState<GifItemWithTags[]>([]);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load GIFs and tags on mount
  useEffect(() => {
    async function load() {
      if (!isElectron) {
        console.warn('Not running in Electron, useElectronGifCollection will not work');
        setIsLoading(false);
        return;
      }

      try {
        const [loadedGifs, loadedTags] = await Promise.all([
          window.api.getGifs(),
          window.api.getTags(),
        ]);
        setGifs(loadedGifs);
        setTags(loadedTags);
      } catch (error) {
        console.error('Failed to load GIF collection:', error);
      }
      setIsLoading(false);
    }

    load();
  }, []);

  // GIF operations
  const addGif = useCallback(async (input: CreateGifInput): Promise<GifItemWithTags> => {
    console.log('addGif called with:', { name: input.name, sourceType: input.sourceType });
    try {
      const newGif = await window.api.addGif(input);
      console.log('addGif succeeded:', newGif);
      setGifs(prev => [newGif, ...prev]);
      return newGif;
    } catch (error) {
      console.error('addGif failed:', error);
      throw error;
    }
  }, []);

  const removeGif = useCallback(async (id: string): Promise<void> => {
    await window.api.deleteGif(id);
    setGifs(prev => prev.filter(gif => gif.id !== id));
  }, []);

  const updateGifName = useCallback(async (id: string, name: string): Promise<void> => {
    const updated = await window.api.updateGif(id, { name });
    setGifs(prev => prev.map(gif => gif.id === id ? updated : gif));
  }, []);

  const toggleFavorite = useCallback(async (id: string): Promise<void> => {
    const gif = gifs.find(g => g.id === id);
    if (!gif) return;
    
    const updated = await window.api.updateGif(id, { isFavorite: !gif.isFavorite });
    setGifs(prev => prev.map(g => g.id === id ? updated : g));
  }, [gifs]);

  const searchGifs = useCallback(async (query: string): Promise<GifItemWithTags[]> => {
    return window.api.searchGifs(query);
  }, []);

  // Tag operations
  const createTag = useCallback(async (name: string): Promise<TagItem> => {
    const newTag = await window.api.createTag(name);
    setTags(prev => [...prev, newTag].sort((a, b) => a.name.localeCompare(b.name)));
    return newTag;
  }, []);

  const updateTag = useCallback(async (id: number, name: string): Promise<void> => {
    const updated = await window.api.updateTag(id, name);
    setTags(prev => prev.map(tag => tag.id === id ? updated : tag));
  }, []);

  const deleteTag = useCallback(async (id: number): Promise<void> => {
    await window.api.deleteTag(id);
    setTags(prev => prev.filter(tag => tag.id !== id));
    // Also update gifs to remove the deleted tag
    setGifs(prev => prev.map(gif => ({
      ...gif,
      tags: gif.tags.filter(tag => tag.id !== id),
    })));
  }, []);

  const addTagToGif = useCallback(async (gifId: string, tagId: number): Promise<void> => {
    await window.api.addTagToGif(gifId, tagId);
    const tag = tags.find(t => t.id === tagId);
    if (tag) {
      setGifs(prev => prev.map(gif => 
        gif.id === gifId 
          ? { ...gif, tags: [...gif.tags, tag].sort((a, b) => a.name.localeCompare(b.name)) }
          : gif
      ));
    }
  }, [tags]);

  const removeTagFromGif = useCallback(async (gifId: string, tagId: number): Promise<void> => {
    await window.api.removeTagFromGif(gifId, tagId);
    setGifs(prev => prev.map(gif => 
      gif.id === gifId 
        ? { ...gif, tags: gif.tags.filter(tag => tag.id !== tagId) }
        : gif
    ));
  }, []);

  const getGifsByTag = useCallback(async (tagId: number): Promise<GifItemWithTags[]> => {
    return window.api.getGifsByTag(tagId);
  }, []);

  return {
    gifs,
    tags,
    isLoading,
    isElectron,
    // GIF operations
    addGif,
    removeGif,
    updateGifName,
    toggleFavorite,
    searchGifs,
    // Tag operations
    createTag,
    updateTag,
    deleteTag,
    addTagToGif,
    removeTagFromGif,
    getGifsByTag,
  };
}
