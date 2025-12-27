import { useState, useCallback, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, Image, X } from 'lucide-react';

interface AddGifDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (name: string, dataUrl: string) => void;
}

export function AddGifDialog({ open, onOpenChange, onAdd }: AddGifDialogProps) {
  const [name, setName] = useState('');
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
      // Auto-fill name from filename if empty
      if (!name) {
        const fileName = file.name.replace(/\.[^/.]+$/, '');
        setName(fileName);
      }
    };
    reader.readAsDataURL(file);
  }, [name]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleSubmit = () => {
    if (!name.trim() || !preview) return;
    onAdd(name, preview);
    handleClose();
  };

  const handleClose = () => {
    setName('');
    setPreview(null);
    onOpenChange(false);
  };

  const clearPreview = () => {
    setPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-chunky border-border shadow-chunky bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add New GIF</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`relative border-chunky border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging
                ? 'border-primary bg-primary/10'
                : 'border-muted-foreground/30 hover:border-primary/50'
            }`}
          >
            {preview ? (
              <div className="relative inline-block">
                <img
                  src={preview}
                  alt="Preview"
                  className="max-h-40 rounded-md border-chunky border-border shadow-chunky-sm"
                />
                <button
                  onClick={clearPreview}
                  className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full border-2 border-border hover:scale-110 transition-transform"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <Image className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display text-lg text-foreground">
                    Drop your GIF here
                  </p>
                  <p className="text-sm text-muted-foreground">or click to browse</p>
                </div>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </div>

          {/* Name input */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-foreground">Name</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., happy dance, thumbs up..."
              className="border-chunky shadow-chunky-sm focus:shadow-chunky"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!name.trim() || !preview}
              className="flex-1"
            >
              <Upload size={18} />
              Add GIF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
