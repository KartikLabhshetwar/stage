'use client';

import * as React from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { X, Monitor } from 'lucide-react';

const DISMISSED_KEY = 'stage-mobile-banner-dismissed';

export function MobileBanner() {
  const isMobile = useIsMobile();
  const [isDismissed, setIsDismissed] = React.useState(true);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = localStorage.getItem(DISMISSED_KEY) === 'true';
      setIsDismissed(dismissed);
    }
  }, []);

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(DISMISSED_KEY, 'true');
      setIsDismissed(true);
    }
  };

  if (!isMobile || isDismissed) {
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-blue-600/90 to-purple-600/90 backdrop-blur-sm border-b border-blue-500/20 px-4 py-3 z-50 relative">
      <div className="flex items-center justify-between gap-3 max-w-7xl mx-auto">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Monitor className="h-5 w-5 text-white shrink-0" />
          <p className="text-sm text-white font-medium">
            For the best experience, please use Stage on a desktop device.
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={handleDismiss}
          className="h-8 w-8 text-white hover:bg-white/20 shrink-0"
          aria-label="Dismiss banner"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

