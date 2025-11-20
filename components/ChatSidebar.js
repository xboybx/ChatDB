'use client';

import { Plus, MessageSquare, Trash2, PanelLeft } from 'lucide-react';
import { useState } from 'react';

export function ChatSidebar({ conversations, activeConversationId, onSelectConversation, onNewConversation, onDeleteConversation }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--border))] h-screen flex flex-col items-center py-2">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-[hsl(var(--sidebar))] border-r border-[hsl(var(--border))] h-screen flex flex-col">
      <div className="p-2 flex items-center gap-1">
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors"
        >
          <PanelLeft className="w-5 h-5" />
        </button>
        <button
          onClick={onNewConversation}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 ${
              activeConversationId === conv.id
                ? 'bg-[hsl(var(--sidebar-active))]'
                : 'hover:bg-[hsl(var(--sidebar-hover))]'
            }`}
          >
            <MessageSquare className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-sm truncate">{conv.title}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteConversation(conv.id);
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-[hsl(var(--sidebar-hover))] rounded transition-opacity"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
