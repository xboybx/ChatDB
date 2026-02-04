'use client';

import { Plus, NotepadText, Trash2, PanelLeft } from 'lucide-react';

export function ChatSidebar({
  conversations,
  activeConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed,
  onToggleCollapse,
}) {
  return (
    <div className="bg-sidebar border-r border-sidebar-border h-screen flex flex-col w-full">
      <div className="p-2 flex items-center">
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="p-2 hover:bg-sidebar-accent rounded-lg transition-colors"
          >
            <PanelLeft className="w-5 h-5 text-sidebar-foreground" />
          </button>
        )}
        <button
          onClick={onNewConversation}
          className={`flex items-center justify-center gap-2 px-3 py-2 hover:bg-sidebar-accent rounded-lg transition-colors text-sm font-medium text-sidebar-foreground ${isCollapsed ? 'w-full' : 'flex-1 ml-2'
            }`}
        >
          <Plus className="w-4 h-4" />
          {!isCollapsed && <span>New chat</span>}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 py-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => onSelectConversation(conv.id)}
            className={`group relative flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-colors mb-1 text-sidebar-foreground ${activeConversationId === conv.id
              ? 'bg-sidebar-accent/50'
              : 'hover:bg-sidebar-accent'
              } ${isCollapsed ? 'justify-center' : ''}`}
          >
            <NotepadText className="w-4 h-4 flex-shrink-0" />
            {!isCollapsed && <span className="flex-1 text-sm truncate">{conv.title}</span>}
            {!isCollapsed && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteConversation(conv.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-sidebar-accent/80 rounded transition-opacity"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}