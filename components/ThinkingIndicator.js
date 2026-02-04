'use client';

import { BrainCog } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-2 sm:gap-4 px-2 sm:px-4 py-6 justify-start">
      <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-muted/20 backdrop-blur-sm border border-border shadow-lg">
        <BrainCog className="w-5 h-5 text-primary animate-pulse" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-end gap-2 px-2">
          <div className="flex gap-1 text-sm font-medium bg-gradient-to-r from-primary via-accent to-primary bg-200% bg-clip-text text-transparent animate-gradient-loader">
            Thinking...
          </div>
        </div>
      </div>
    </div>
  );
}