import { useState, useEffect } from 'react';
import { Plus, Search, Command } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useGifCollection } from '@/hooks/useGifCollection';
import { AddGifDialog } from '@/components/AddGifDialog';
import { GifCard } from '@/components/GifCard';
import { SearchPopup } from '@/components/SearchPopup';
import { EmptyState } from '@/components/EmptyState';

const Index = () => {
  const { gifs, addGif, removeGif, updateGifName, searchGifs } = useGifCollection();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  // Global keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-sm border-b-chunky border-border">
        <div className="container max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-3xl md:text-4xl text-foreground">
              GIF Stash 📦
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setIsSearchOpen(true)}
                className="hidden sm:flex"
              >
                <Search size={18} />
                Search
                <kbd className="ml-2 flex items-center gap-0.5 text-xs bg-muted px-1.5 py-0.5 rounded border border-border">
                  <Command size={10} />K
                </kbd>
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsSearchOpen(true)}
                className="sm:hidden"
              >
                <Search size={18} />
              </Button>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus size={18} />
                <span className="hidden sm:inline">Add GIF</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Divider line */}
      <div className="h-1 bg-gradient-to-r from-primary via-accent to-secondary" />

      {/* Main content */}
      <main className="container max-w-5xl mx-auto px-4 py-8">
        {gifs.length === 0 ? (
          <EmptyState onAddClick={() => setIsAddDialogOpen(true)} />
        ) : (
          <>
            <p className="text-muted-foreground mb-6">
              {gifs.length} GIF{gifs.length !== 1 ? 's' : ''} in your collection
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {gifs.map((gif) => (
                <GifCard
                  key={gif.id}
                  gif={gif}
                  onRemove={removeGif}
                  onUpdateName={updateGifName}
                />
              ))}
            </div>
          </>
        )}
      </main>

      {/* Dialogs */}
      <AddGifDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAdd={addGif}
      />

      <SearchPopup
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        gifs={gifs}
        searchGifs={searchGifs}
      />
    </div>
  );
};

export default Index;
