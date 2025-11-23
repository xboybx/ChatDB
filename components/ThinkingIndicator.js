'use client';

import { BrainCog } from 'lucide-react';

export function ThinkingIndicator() {
  return (
    <div className="w-full border-b border-[hsl(var(--border))]">
      <div className="max-w-3xl mx-auto px-4 py-6 flex gap-2 items-center">
        <div className="flex-shrink-0 w-8 h-8 rounded-sm bg-black flex items-center justify-center">
          <BrainCog className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-end gap-2">
            <div className="flex gap-1 text-sm  bg-gradient-to-r from-black via-white to-black bg-200% bg-clip-text  text-transparent animate-gradient-loader [text-fill-color:transparent] [-webkit-text-fill-color:transparent][-webkit-background-clip:text]">
              Thinking..
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
