'use client';

import { useState, useEffect } from 'react';
import { BrainCog, User, ChevronDown, ChevronUp, Clipboard, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function ChatMessage({ message }) {
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = () => {
    navigator.clipboard.writeText(message.query_command).then(() => {
      setIsCopied(true);
    });
  };

  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => {
        setIsCopied(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  return (
    <div className={`flex items-start gap-2 sm:gap-4 px-2 sm:px-4 py-6 ${isUser ? 'justify-end' : 'justify-start'} `}>
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center  bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg ">
          <BrainCog className="w-5 h-5 text-[#4DB33D] dark:text-white" />
        </div>
      )}
      <div
        className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-3xl rounded-lg p-3 break-words overflow-x-auto ${isUser
          ? 'bg-gray-600 dark:bg-[#2d2d2d] text-white' : 'bg-[hsl(var(--message-assistant))]'
          }`}
      >
        {message.query_command && (
          <div className="mb-2 ">
            <div className="flex items-center justify-between">
              <button
                className="flex items-center text-left text-xs text-[hsl(var(--foreground))] opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setIsQueryExpanded(!isQueryExpanded)}
              >
                <span>Generated Query</span>
                {isQueryExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
              <button onClick={copyToClipboard} className="text-xs text-[hsl(var(--foreground))] opacity-70 hover:opacity-100 transition-opacity">
                {isCopied ? <span>Copied!</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {isQueryExpanded && (
              <div className="mt-2 p-2 bg-black dark:bg-[#2d2d2d] rounded-lg text-xs font-mono text-[#10a37f] overflow-x-auto">
                <pre className="whitespace-pre-wrap">{message.query_command}</pre>
              </div>
            )}
          </div>
        )}
        <div className="chat-message prose prose-sm dark:prose-invert prose-pre:bg-black dark:prose-pre:bg-[#2d2d2d] prose-pre:text-gray-100 prose-code:text-[#10a37f]">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
          <User className="w-5 h-5 text-[#3F3E42  ] dark:text-white" />
        </div>
      )}
    </div>
  );
}