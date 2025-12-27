import { Image, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  onAddClick: () => void;
}

export function EmptyState({ onAddClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center mb-6 animate-float">
        <Image className="w-12 h-12 text-muted-foreground" />
      </div>
      <h2 className="font-display text-3xl text-foreground mb-2">
        No GIFs yet!
      </h2>
      <p className="text-muted-foreground max-w-sm mb-6">
        Start building your collection by adding your favorite GIFs. 
        Give them names so you can find them later.
      </p>
      <Button onClick={onAddClick} size="lg">
        <Plus size={20} />
        Add Your First GIF
      </Button>
    </div>
  );
}
