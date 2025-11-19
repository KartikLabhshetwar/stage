'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { FaCoffee, FaDollarSign, FaMobileAlt, FaCopy, FaCheck, FaHeart } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Heart } from 'lucide-react';
import { Button as MovingBorderButton } from '@/components/ui/moving-border';

interface SponsorButtonProps {
  className?: string;
  variant?: 'bar' | 'floating';
}

export function SponsorButton({ className, variant = 'bar' }: SponsorButtonProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const upiId = 'kartik.labhshetwar@oksbi';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(upiId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (variant === 'floating') {
    return (
      <div className={cn('fixed bottom-6 right-6 z-50', className)}>
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all"
              aria-label="Sponsor"
            >
              <Heart className="h-6 w-6" />
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-80 p-0" 
            align="end"
            side="top"
            sideOffset={12}
          >
            <SponsorContent upiId={upiId} copied={copied} onCopy={handleCopy} />
          </PopoverContent>
        </Popover>
      </div>
    );
  }

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <MovingBorderButton
          as="button"
          borderRadius="0.5rem"
          containerClassName={cn("h-10", className)}
          borderClassName=""
          gradientColor="var(--primary)"
          className="gap-2 bg-background hover:bg-accent text-foreground border border-border"
        >
          <FaHeart className="h-6 w-6 text-red-400" />
          <span>Sponsor</span>
        </MovingBorderButton>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end"
        side="top"
        sideOffset={8}
      >
        <SponsorContent upiId={upiId} copied={copied} onCopy={handleCopy} />
      </PopoverContent>
    </Popover>
  );
}

function SponsorContent({ 
  upiId, 
  copied, 
  onCopy 
}: { 
  upiId: string; 
  copied: boolean; 
  onCopy: () => void;
}) {
  return (
    <div className="p-4 space-y-3">
      {/* Buy Me Coffee */}
      <a
        href="https://buymeacoffee.com/code_kartik"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
      >
        <div className="h-10 w-10 rounded-lg bg-yellow-400 flex items-center justify-center shrink-0">
          <FaCoffee className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground group-hover:text-foreground">
          Buy Me Coffee
        </span>
      </a>

      {/* PayPal */}
      <a
        href="https://www.paypal.com/paypalme/KartikLabhshetwar"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors cursor-pointer group"
      >
        <div className="h-10 w-10 rounded-lg bg-blue-500 flex items-center justify-center shrink-0">
          <FaDollarSign className="h-5 w-5 text-white" />
        </div>
        <span className="text-sm font-medium text-foreground group-hover:text-foreground">
          PayPal
        </span>
      </a>

      {/* UPI Payment */}
      <div className="p-3 rounded-lg border border-border bg-muted">
        <div className="flex items-center gap-3 mb-3">
          <div className="h-10 w-10 rounded-lg bg-green-500 flex items-center justify-center shrink-0">
            <FaMobileAlt className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1">
            <span className="text-sm font-medium text-foreground block">
              UPI Payment
            </span>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">Scan QR or copy UPI ID</span>
              <button
                onClick={onCopy}
                className="p-1 hover:bg-accent rounded transition-colors"
                aria-label="Copy UPI ID"
              >
                {copied ? (
                  <FaCheck className="h-3 w-3 text-green-500" />
                ) : (
                  <FaCopy className="h-3 w-3 text-muted-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* QR Code */}
        <div className="bg-background p-4 rounded-lg flex items-center justify-center mb-3">
          <div className="w-48 h-48 border-2 border-border rounded-lg flex items-center justify-center bg-background relative overflow-hidden">
            <img 
              src="/qr.jpeg" 
              alt="UPI QR Code" 
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-xs font-medium text-foreground mb-1">UPI ID: {upiId}</p>
          <p className="text-xs text-muted-foreground">Scan to pay with any UPI app</p>
        </div>
      </div>
    </div>
  );
}

