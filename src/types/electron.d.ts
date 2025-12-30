import type { GifItemWithTags, TagItem, CreateGifInput } from '../../electron/types';

// Type declaration for the Electron API exposed via preload
declare global {
  interface Window {
    api?: {
      // GIF operations
      getGifs: () => Promise<GifItemWithTags[]>;
      getGif: (id: string) => Promise<GifItemWithTags | null>;
      addGif: (input: CreateGifInput) => Promise<GifItemWithTags>;
      updateGif: (id: string, updates: { name?: string; isFavorite?: boolean }) => Promise<GifItemWithTags>;
      deleteGif: (id: string) => Promise<void>;
      searchGifs: (query: string) => Promise<GifItemWithTags[]>;
      getGifPath: (id: string) => Promise<string>;
      copyGifToClipboard: (id: string) => Promise<{ success: boolean; method: string }>;
      
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

export {};
