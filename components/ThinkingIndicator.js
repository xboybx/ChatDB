'use client';

import { BrainCog } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="w-full border-b border-[hsl(var(--border))]">
      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-6">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-black flex items-center justify-center">
          <BrainCog className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="flex gap-1">
              <span className="w-2 h-2 bg-[hsl(var(--foreground))] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-[hsl(var(--foreground))] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-[hsl(var(--foreground))] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
