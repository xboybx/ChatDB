'use client';

import { useState, useEffect } from 'react';
import { BrainCog, User, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

export function ChatMessage({ message }) {
  const [isQueryExpanded, setIsQueryExpanded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const isUser = message.role === 'user';

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
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
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-muted/20 backdrop-blur-sm border border-border shadow-lg">
          <BrainCog className="w-5 h-5 text-primary" />
        </div>
      )}
      <div
        className={`max-w-[90%] sm:max-w-[85%] md:max-w-[75%] lg:max-w-3xl break-words overflow-x-auto ${isUser
          ? 'text-black dark:text-white rounded-lg p-3' : ''
          }`}
      >
        {message.query_command && (
          <div className="mb-2 ">
            <div className="flex items-center justify-between">
              <button
                className="flex items-center text-left text-xs text-foreground opacity-70 hover:opacity-100 transition-opacity"
                onClick={() => setIsQueryExpanded(!isQueryExpanded)}
              >
                <span>Generated Query</span>
                {isQueryExpanded ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
              </button>
              <button onClick={() => copyToClipboard(message.query_command)} className="text-xs text-foreground opacity-70 hover:opacity-100 transition-opacity">
                {isCopied ? <span>Copied!</span> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {isQueryExpanded && (
              <div className="mt-2 p-2 bg-muted/30 dark:bg-muted/10 rounded-lg text-xs font-mono text-primary overflow-x-auto border border-border/50">
                <pre className="whitespace-pre-wrap">{message.query_command}</pre>
              </div>
            )}
          </div>
        )}
        <div className="chat-message prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {message.content}
          </ReactMarkdown>
        </div>
      </div>
      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-sm flex items-center justify-center bg-muted/20 backdrop-blur-sm border border-border shadow-lg">
          <User className="w-5 h-5 text-secondary dark:text-foreground" />
        </div>
      )}
    </div>
  );
}