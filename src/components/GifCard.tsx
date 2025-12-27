import { useState } from 'react';
import { GifItem } from '@/types/gif';
import { Trash2, Copy, Check, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface GifCardProps {
  gif: GifItem;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, name: string) => void;
}

export function GifCard({ gif, onRemove, onUpdateName }: GifCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(gif.name);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      // Copy the image data to clipboard
      const response = await fetch(gif.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
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
          src={gif.dataUrl}
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
