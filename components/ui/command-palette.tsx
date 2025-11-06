'use client';

import * as React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Search, Sparkles } from 'lucide-react';

export interface CommandPaletteItem {
  id: string;
  label: string;
  keywords?: string[];
  icon?: React.ReactNode;
  action: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CommandPaletteItem[];
  searchPlaceholder?: string;
  title?: string;
  emptyMessage?: string;
  generateRandomLabel?: string;
  onGenerateRandom?: () => void;
}

export function CommandPalette({
  open,
  onOpenChange,
  items,
  searchPlaceholder = 'Search...',
  title = 'Command Palette',
  emptyMessage = 'No results found',
  generateRandomLabel = 'Generate Random',
  onGenerateRandom,
}: CommandPaletteProps) {
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items;
    
    const searchLower = search.toLowerCase();
    return items.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(searchLower);
      const matchesKeywords = item.keywords?.some((keyword) =>
        keyword.toLowerCase().includes(searchLower)
      );
      return matchesLabel || matchesKeywords;
    });
  }, [items, search]);

  // Reset selected index when search changes
  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  React.useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (selectedIndex < filteredItems.length) {
          filteredItems[selectedIndex].action();
          onOpenChange(false);
        }
      } else if (e.key === 'Escape') {
        onOpenChange(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, filteredItems, selectedIndex, onOpenChange]);

  const handleItemClick = (item: CommandPaletteItem) => {
    item.action();
    onOpenChange(false);
    setSearch('');
  };

  const handleGenerateRandom = () => {
    if (onGenerateRandom) {
      onGenerateRandom();
      onOpenChange(false);
      setSearch('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 max-w-2xl" showCloseButton={false}>
        <DialogTitle className="sr-only">{title}</DialogTitle>
        <div className="flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2 px-3 py-2 border border-border rounded-lg bg-background">
              <Search className="h-4 w-4 text-muted-foreground shrink-0" />
              <Input
                placeholder={searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent px-0 h-auto py-0"
                autoFocus
              />
            </div>
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto p-2">
            {onGenerateRandom && (
              <button
                onClick={handleGenerateRandom}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                  'hover:bg-accent focus:bg-accent focus:outline-none',
                  'border border-border/50 hover:border-border'
                )}
              >
                <Sparkles className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm font-medium">{generateRandomLabel}</span>
              </button>
            )}

            {filteredItems.length > 0 ? (
              <div className="mt-2 space-y-1">
                {filteredItems.map((item, index) => (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors text-left',
                      'hover:bg-accent focus:bg-accent focus:outline-none',
                      index === selectedIndex && 'bg-accent',
                      !item.icon && 'pl-3'
                    )}
                  >
                    {item.icon && (
                      <span className="shrink-0">{item.icon}</span>
                    )}
                    <span className="text-sm font-medium flex-1">{item.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="px-3 py-8 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-border bg-muted/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs">
                    ↑↓
                  </kbd>{' '}
                  Navigate
                </span>
                <span>
                  <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs">
                    Enter
                  </kbd>{' '}
                  Select
                </span>
              </div>
              <span>
                <kbd className="px-1.5 py-0.5 rounded bg-background border border-border text-xs">
                  Esc
                </kbd>{' '}
                Close
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

