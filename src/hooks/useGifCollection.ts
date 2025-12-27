import { useState, useEffect, useCallback } from 'react';
import { GifItem } from '@/types/gif';

const STORAGE_KEY = 'gif-collection';

export function useGifCollection() {
  const [gifs, setGifs] = useState<GifItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setGifs(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Failed to load GIF collection:', e);
    }
    setIsLoading(false);
  }, []);

  // Save to localStorage whenever gifs change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(gifs));
    }
  }, [gifs, isLoading]);

  const addGif = useCallback((name: string, dataUrl: string) => {
    const newGif: GifItem = {
      id: crypto.randomUUID(),
      name: name.trim(),
      dataUrl,
      createdAt: Date.now(),
    };
    setGifs((prev) => [newGif, ...prev]);
    return newGif;
  }, []);

  const removeGif = useCallback((id: string) => {
    setGifs((prev) => prev.filter((gif) => gif.id !== id));
  }, []);

  const updateGifName = useCallback((id: string, newName: string) => {
    setGifs((prev) =>
      prev.map((gif) =>
        gif.id === id ? { ...gif, name: newName.trim() } : gif
      )
    );
  }, []);

  const searchGifs = useCallback(
    (query: string): GifItem[] => {
      if (!query.trim()) return gifs;
      const lowerQuery = query.toLowerCase();
      return gifs.filter((gif) =>
        gif.name.toLowerCase().includes(lowerQuery)
      );
    },
    [gifs]
  );

  return {
    gifs,
    isLoading,
    addGif,
    removeGif,
    updateGifName,
    searchGifs,
  };
}
