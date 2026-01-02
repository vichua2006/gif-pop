import { useState, useEffect, useRef } from 'react';
import type { GifItemWithTags } from '../../electron/types';
import { Search } from 'lucide-react';

export default function SearchPopupPage() {
  const [query, setQuery] = useState('');
  const [gifs, setGifs] = useState<GifItemWithTags[]>([]);
  const [results, setResults] = useState<GifItemWithTags[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // Make body and html transparent for popup
  useEffect(() => {
    document.body.style.backgroundColor = 'transparent';
    document.documentElement.style.backgroundColor = 'transparent';
    const root = document.getElementById('root');
    if (root) {
      root.style.backgroundColor = 'transparent';
    }
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
      if (root) {
        root.style.backgroundColor = '';
      }
    };
  }, []);

  // Load GIFs on mount
  useEffect(() => {
    async function load() {
      if (window.api) {
        try {
          const loadedGifs = await window.api.getGifs();
          setGifs(loadedGifs);
          setResults(loadedGifs.slice(0, 8));
        } catch (error) {
          console.error('Failed to load GIFs:', error);
        }
      }
      setIsLoading(false);
    }
    load();
    inputRef.current?.focus();
  }, []);

  // Update results when query changes
  useEffect(() => {
    if (!query.trim()) {
      setResults(gifs.slice(0, 8));
    } else if (window.api) {
      window.api.searchGifs(query).then(setResults);
    }
    setSelectedIndex(0);
  }, [query, gifs]);

  const closePopup = () => {
    if (window.api?.closeWindow) {
      window.api.closeWindow();
    } else {
      window.close();
    }
  };

  const handleSelect = async (gif: GifItemWithTags) => {
    try {
      if (window.api?.copyGifToClipboard) {
        await window.api.copyGifToClipboard(gif.id);
        closePopup();
      }
    } catch (err) {
      console.error('Copy failed:', err);
      closePopup();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closePopup();
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

  return (
    <div className="w-full h-full bg-transparent p-2">
      <div className="w-full bg-card border-[3px] border-border rounded-xl shadow-2xl overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b-[3px] border-border bg-card">
          <Search className="w-5 h-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search your GIFs..."
            autoFocus
            className="flex-1 bg-transparent font-display text-xl outline-none placeholder:text-muted-foreground/50"
          />
          <kbd className="px-2 py-1 text-xs bg-muted rounded border-2 border-border">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-56 overflow-y-auto p-2 bg-card">
          {isLoading ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Loading...</p>
            </div>
          ) : results.length === 0 ? (
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
                    src={gif.filePath}
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
          <div className="px-4 py-2 border-t-[3px] border-border bg-muted/50 text-xs text-muted-foreground flex items-center gap-4">
            <span>↑↓ Navigate</span>
            <span>↵ Copy</span>
            <span>Esc Close</span>
          </div>
        )}
      </div>
    </div>
  );
}

