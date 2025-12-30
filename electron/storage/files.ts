import * as fs from 'fs/promises';
import * as path from 'path';
import { app } from 'electron';
import { randomUUID } from 'crypto';

export function getGifDirectory(): string {
  const userDataPath = app.getPath('userData');
  return path.join(userDataPath, 'gifs');
}

export async function ensureGifDirectory(): Promise<void> {
  const gifDir = getGifDirectory();
  await fs.mkdir(gifDir, { recursive: true });
  console.log('GIF directory ensured at:', gifDir);
}

export function getGifFilePath(id: string): string {
  return path.join(getGifDirectory(), `${id}.gif`);
}

export async function saveGifFromPath(sourcePath: string): Promise<string> {
  const id = randomUUID();
  const destPath = getGifFilePath(id);
  await fs.copyFile(sourcePath, destPath);
  return id;
}

export async function saveGifFromDataUrl(dataUrl: string): Promise<string> {
  const id = randomUUID();
  const destPath = getGifFilePath(id);
  
  // Extract base64 data from data URL - more permissive regex
  // Matches: data:image/gif;base64,... or data:image/png;base64,... etc.
  const matches = dataUrl.match(/^data:[^;]+;base64,(.+)$/);
  if (!matches) {
    console.error('Invalid data URL format. URL starts with:', dataUrl.substring(0, 50));
    throw new Error('Invalid data URL format');
  }
  
  const buffer = Buffer.from(matches[1], 'base64');
  await fs.writeFile(destPath, buffer);
  console.log('GIF saved to:', destPath);
  return id;
}

export async function deleteGifFile(id: string): Promise<void> {
  const filePath = getGifFilePath(id);
  try {
    await fs.unlink(filePath);
  } catch (error: any) {
    // Ignore if file doesn't exist
    if (error.code !== 'ENOENT') {
      throw error;
    }
  }
}

export async function gifFileExists(id: string): Promise<boolean> {
  const filePath = getGifFilePath(id);
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

export function getGifFileUrl(id: string): string {
  const filePath = getGifFilePath(id);
  // Return file:// URL for Electron to load
  // On Windows, paths are like C:\Users\... and need to be file:///C:/Users/...
  const normalizedPath = filePath.replace(/\\/g, '/');
  return `file:///${normalizedPath}`;
}
