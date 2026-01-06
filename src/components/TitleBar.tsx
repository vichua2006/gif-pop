import { useEffect, useState } from 'react';
import { Minus, Maximize2, X, Square } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useElectronGifCollection } from '@/hooks/useElectronGifCollection';

export function TitleBar() {
  const { isElectron } = useElectronGifCollection();
  const [isMaximized, setIsMaximized] = useState(false);

  // Check if window is maximized on mount and when window state changes
  useEffect(() => {
    if (!isElectron || !window.api) return;

    const checkMaximized = async () => {
      const maximized = await window.api!.isWindowMaximized();
      setIsMaximized(maximized);
    };

    checkMaximized();

    // Check periodically (could be improved with IPC events if available)
    const interval = setInterval(checkMaximized, 100);
    return () => clearInterval(interval);
  }, [isElectron]);

  if (!isElectron || !window.api) {
    return null;
  }

  const handleMinimize = () => {
    window.api?.minimizeWindow();
  };

  const handleMaximize = () => {
    window.api?.maximizeWindow();
    // State will be updated by the interval check
  };

  const handleClose = () => {
    window.api?.closeWindow();
  };

  return (
    <div 
      className="flex items-center justify-between h-8 bg-background border-b-[3px] border-border px-2 select-none"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left side - App title/logo area (draggable) */}
      <div className="flex items-center gap-2 px-2">
        <span className="text-sm font-display font-bold text-foreground">
          GIF Stash
        </span>
      </div>

      {/* Right side - Window controls (not draggable) */}
      <div 
        className="flex items-center gap-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-none hover:bg-muted"
          onClick={handleMinimize}
          title="Minimize"
        >
          <Minus size={14} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-none hover:bg-muted"
          onClick={handleMaximize}
          title={isMaximized ? "Restore" : "Maximize"}
        >
          {isMaximized ? <Square size={12} /> : <Maximize2 size={12} />}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-none hover:bg-destructive hover:text-destructive-foreground"
          onClick={handleClose}
          title="Close"
        >
          <X size={14} />
        </Button>
      </div>
    </div>
  );
}
