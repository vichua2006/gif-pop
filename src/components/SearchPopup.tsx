import { useState, useEffect, useRef } from 'react';
import { GifItem } from '@/types/gif';
import { Search, Command } from 'lucide-react';
import { toast } from 'sonner';

interface SearchPopupProps {
  isOpen: boolean;
  onClose: () => void;
  gifs: GifItem[];
  searchGifs: (query: string) => GifItem[];
}

export function SearchPopup({ isOpen, onClose, gifs, searchGifs }: SearchPopupProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim() ? searchGifs(query) : gifs.slice(0, 8);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  const handleSelect = async (gif: GifItem) => {
    try {
      const response = await fetch(gif.dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([
        new ClipboardItem({ [blob.type]: blob }),
      ]);
      toast.success(`${gif.name} copied!`);
      onClose();
    } catch {
      toast.error('Failed to copy');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      handleSelect(results[selectedIndex]);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Popup */}
      <div className="relative w-full max-w-lg mx-4 bg-card border-chunky border-border rounded-xl shadow-chunky-hover animate-bounce-in overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-chunky border-border">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your GIFs..."
            className="flex-1 bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs bg-muted rounded border-2 border-border">
            <Command size={12} />K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p className="font-display text-lg">No GIFs found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              {results.map((gif, index) => (
                <button
                  key={gif.id}
                  onClick={() => handleSelect(gif)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`aspect-square p-2 rounded-lg border-2 transition-all ${
                    index === selectedIndex
                      ? 'border-primary bg-primary/10 scale-105'
                      : 'border-transparent hover:border-muted-foreground/30'
                  }`}
                >
                  <img
                    src={gif.dataUrl}
                    alt={gif.name}
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer hint */}
        {results.length > 0 && (
          <div className="px-4 py-2 border-t-chunky border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>Esc Close</span>
          </div>
        )}
      </div>
    </div>
  );
}
