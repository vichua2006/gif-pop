// Shared types between main and renderer processes

export interface TagItem {
  id: number;
  name: string;
}

export interface GifItemWithTags {
  id: string;
  name: string;
  createdAt: number;
  isFavorite: boolean;
  tags: TagItem[];
  // For renderer: either file:// URL or data URL for web preview
  filePath: string;
}

export interface CreateGifInput {
  name: string;
  // Can be a file path (when running in Electron) or data URL (for migration)
  sourceData: string;
  // Optionally specify the source type
  sourceType?: 'file' | 'dataUrl';
}

// Database row types (internal)
export interface GifRow {
  id: string;
  name: string;
  created_at: number;
  is_favorite: number; // SQLite stores booleans as 0/1
}

export interface TagRow {
  id: number;
  name: string;
}

export interface GifTagRow {
  gif_id: string;
  tag_id: number;
}
