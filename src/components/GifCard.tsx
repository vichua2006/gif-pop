import { useState } from 'react';
import type { GifItemWithTags } from '../../electron/types';
import { Trash2, Copy, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GifCardProps {
  gif: GifItemWithTags;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
}

export function GifCard({ gif, onRemove, onUpdateName }: GifCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(gif.name);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Use native Electron clipboard for better GIF support
      if (window.api?.copyGifToClipboard) {
        const result = await window.api.copyGifToClipboard(gif.id);
        setCopied(true);
        if (result.method === 'file') {
          toast.success('GIF copied! Paste anywhere.');
        } else if (result.method === 'image') {
          toast.success('Copied as image!');
        } else {
          toast.success('Copied file path!');
        }
        setTimeout(() => setCopied(false), 2000);
      } else {
        // Fallback for non-Electron: use web clipboard API
        const response = await fetch(gif.filePath);
        const blob = await response.blob();
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type]: blob }),
        ]);
        setCopied(true);
        toast.success('Copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      console.error('Copy failed:', err);
      // Fallback: copy name
      await navigator.clipboard.writeText(gif.name);
      toast.info('Copied name to clipboard');
    }
  };

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(gif.id, editName);
    } else {
      setEditName(gif.name);
    }
    setIsEditing(false);
  };

  return (
    <div className="group relative bg-card border-chunky border-border rounded-lg shadow-chunky hover:shadow-chunky-hover hover:-translate-x-[1px] hover:-translate-y-[1px] transition-all duration-150 overflow-hidden">
      {/* Image */}
      <div className="aspect-square p-3 flex items-center justify-center bg-muted/30">
        <img
          src={gif.filePath}
          alt={gif.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Divider */}
      <div className="h-[3px] bg-border" />

      {/* Footer */}
      <div className="p-3">
        {isEditing ? (
          <Input
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveName();
              if (e.key === 'Escape') {
                setEditName(gif.name);
                setIsEditing(false);
              }
            }}
            autoFocus
            className="h-8 text-sm border-chunky"
          />
        ) : (
          <p
            onClick={() => setIsEditing(true)}
            className="font-display text-lg truncate cursor-pointer hover:text-primary transition-colors"
            title={gif.name}
          >
            {gif.name}
          </p>
        )}
      </div>

      {/* Hover actions */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-card"
          onClick={() => setIsEditing(true)}
        >
          <Pencil size={14} />
        </Button>
        <Button
          size="icon"
          variant="outline"
          className="h-8 w-8 bg-card"
          onClick={handleCopy}
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </Button>
        <Button
          size="icon"
          variant="destructive"
          className="h-8 w-8"
          onClick={() => onRemove(gif.id)}
        >
          <Trash2 size={14} />
        </Button>
      </div>
    </div>
  );
}
