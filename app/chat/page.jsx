/* eslint-disable react/no-unescaped-entities */
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Send,
  Upload,
  Database,
  Settings,
  Sun,
  Moon,
  MoreVertical,
  Paperclip,
  Menu,
  X,
} from "lucide-react";
const ChatSidebar = dynamic(
  () => import("@/components/ChatSidebar").then((mod) => mod.ChatSidebar),
  { ssr: false }
);
const ChatMessage = dynamic(
  () => import("@/components/ChatMessage").then((mod) => mod.ChatMessage),
  { ssr: false }
);
const ThinkingIndicator = dynamic(
  () =>
    import("@/components/ThinkingIndicator").then(
      (mod) => mod.ThinkingIndicator
    ),
  { ssr: false }
);
import { useTheme } from "@/components/ThemeProvider";
import dynamic from "next/dynamic";

const DatasetUpload = dynamic(
  () => import("@/components/DatasetUpload").then((mod) => mod.DatasetUpload),
  { ssr: false }
);
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Fredoka } from "next/font/google";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-fredoka",
});

function ChatPage() {
  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [queryLanguage, setQueryLanguage] = useState("auto");
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDesktopSidebarCollapsed, setIsDesktopSidebarCollapsed] =
    useState(false);
  const [activeDataset, setActiveDataset] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  const loadConversations = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/conversations");
      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
        if (data.conversations.length > 0 && !activeConversationId) {
          setActiveConversationId(data.conversations[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setIsLoading(false);
    }
  }, [activeConversationId]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  useEffect(() => {
    if (activeConversationId) {
      loadMessages(activeConversationId);
      loadDataset(activeConversationId);
    }
  }, [activeConversationId]);

  const loadMessages = async (conversationId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/messages?conversationId=${conversationId}`
      );
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDataset = async (conversationId) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/dataset?conversationId=${conversationId}`
      );
      const data = await response.json();
      if (data.success && data.dataset) {
        setActiveDataset(data.dataset);
      }
    } catch (error) {
      console.error("Failed to load dataset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewConversation = async () => {
    try {
      const response = await fetch("/api/conversations", {
        method: "POST",
      });
      const data = await response.json();
      if (data.success) {
        setConversations([data.conversation, ...conversations]);
        setActiveConversationId(data.conversation.id);
        setMessages([]);
        setActiveDataset(null);
      }
    } catch (error) {
      console.error("Failed to create conversation:", error);
    }
  };

  const handleDeleteConversation = async (conversationId) => {
    try {
      const response = await fetch(`/api/conversations?id=${conversationId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setConversations(conversations.filter((c) => c.id !== conversationId));
        if (activeConversationId === conversationId) {
          const remaining = conversations.filter(
            (c) => c.id !== conversationId
          );
          setActiveConversationId(
            remaining.length > 0 ? remaining[0].id : null
          );
        }
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;
    if (!activeConversationId) {
      await handleNewConversation();
      return;
    }

    const userMessage = {
      role: "user",
      content: inputValue,
      created_at: new Date().toISOString(),
    };

    setMessages([...messages, userMessage]);
    setInputValue("");
    setIsThinking(true);

    try {
      const response = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: activeConversationId,
          message: inputValue,
          queryLanguage,
          datasetId: activeDataset?.id,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setMessages([...messages, userMessage, data.assistantMessage]);
        await loadConversations();
      } else {
        if (data.error === "GEMINI_MODEL_NOT_FOUND") {
          alert(
            "The AI model (gemini-pro) is not available. Please check your API key and model configuration."
          );
        } else {
          alert(data.error || "Failed to process query");
        }
      }
    } catch (error) {
      console.error("Query error:", error);
      alert("Failed to send message");
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDatasetAdded = (dataset) => {
    setActiveDataset(dataset);
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        Math.min(textareaRef.current.scrollHeight, 200) + "px";
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      className={`${fredoka.variable} font-fredoka flex h-full overflow-hidden bg-background`}
    >
      <div
        className={`hidden md:block transition-all duration-300 ease-in-out ${
          isDesktopSidebarCollapsed ? "w-20" : "w-64"
        }`}
      >
        <ChatSidebar
          conversations={conversations}
          activeConversationId={activeConversationId}
          onSelectConversation={setActiveConversationId}
          onNewConversation={handleNewConversation}
          onDeleteConversation={handleDeleteConversation}
          isCollapsed={isDesktopSidebarCollapsed}
          onToggleCollapse={() =>
            setIsDesktopSidebarCollapsed(!isDesktopSidebarCollapsed)
          }
        />
      </div>

      {isSidebarOpen && (
        <div className="md:hidden fixed inset-0 z-20">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsSidebarOpen(false)}
          ></div>
          <div className="relative w-64 h-full">
            <ChatSidebar
              conversations={conversations}
              activeConversationId={activeConversationId}
              onSelectConversation={(id) => {
                setActiveConversationId(id);
                setIsSidebarOpen(false);
              }}
              onNewConversation={handleNewConversation}
              onDeleteConversation={handleDeleteConversation}
            />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <div className="md:hidden flex items-center justify-between p-2 border-b  border-[hsl(var(--border)))]">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
          <h2 className="text-lg font-semibold">Chat</h2>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1.5 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                <Database className="w-4 h-4 mr-2" />
                Connect Database
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={toggleTheme}>
                {theme === "dark" ? (
                  <Sun className="w-4 h-4 mr-2" />
                ) : (
                  <Moon className="w-4 h-4 mr-2" />
                )}
                {theme === "dark" ? "Light" : "Dark"} Mode
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center justify-center pt-4">
          <div className="hidden md:flex w-1/2 rounded-3xl items-center justify-between p-2 px-4  border-b border-[hsl(var(--border)))] bg-transparent">
            <h2 className=" font-semibold flex items-center justify-center ">
              Chat DB
            </h2>
            <h2 className="text-[hsl(var(--foreground))] text-xs opacity-70 hidden lg:block ">
              Upload your DB Connection string to get started
            </h2>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors">
                  <MoreVertical className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload File
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                  <Database className="w-4 h-4 mr-2" />
                  Connect Database
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() =>
                    setQueryLanguage(
                      queryLanguage === "auto"
                        ? "sql"
                        : queryLanguage === "sql"
                        ? "mongodb"
                        : "auto"
                    )
                  }
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Query: {queryLanguage}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={toggleTheme}>
                  {theme === "dark" ? (
                    <Sun className="w-4 h-4 mr-2" />
                  ) : (
                    <Moon className="w-4 h-4 mr-2" />
                  )}
                  {theme === "dark" ? "Light" : "Dark"} Mode
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto  p-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full px-4 ">
              <div className="max-w-2xl w-full text-center space-y-6">
                <h1 className="text-xl  font-semibold">
                  AI Data Query Assistant
                </h1>

                <p className="text-[hsl(var(--foreground))] opacity-70 hidden lg:block">
                  Upload a file or connect to a database to start asking
                  questions about your data
                </p>

                {activeDataset && (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--message-assistant))] border border-[hsl(var(--border))] text-sm">
                    <div className="w-2 h-2 rounded-full bg-[#10a37f]"></div>
                    <span className="font-medium">{activeDataset.name}</span>
                    <span className="opacity-60">({activeDataset.type})</span>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-2xl mx-auto">
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-left"
                  >
                    <Upload className="w-5 h-5" />
                    <div>
                      <div className="font-medium text-sm">Upload File</div>
                      <div className="text-xs opacity-60">
                        Excel, CSV, PDF, DOCX
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setShowUploadDialog(true)}
                    className="flex items-center gap-3 p-4 rounded-xl border border-[hsl(var(--border))] hover:bg-[hsl(var(--sidebar-hover))] transition-colors text-left"
                  >
                    <Database className="w-5 h-5" />
                    <div>
                      <div className="font-medium text-sm">
                        Connect Database
                      </div>
                      <div className="text-xs opacity-60">
                        PostgreSQL, MongoDB
                      </div>
                    </div>
                  </button>
                </div>
                <div className="text-xs text-left opacity-60 mt-4 max-w-2xl mx-auto ">
                  <p className="font-medium mb-2">How to use the app:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>
                      Before Upload Start a new conversation by Clicking{" "}
                      <span className=" text-red-500 px-2 py-1 rounded-full">
                        &quot;New Chat +&quot;
                      </span>{" "}
                      at top left
                    </li>
                    <li>
                      Upload your data files (Excel, CSV, PDF, DOCX) to start a
                      conversation about them.
                    </li>
                    <li>
                      Connect to your PostgreSQL or MongoDB database to query it
                      using natural language.
                    </li>
                    <li>
                      For database connections, you will need to provide the
                      correct connection string.
                      <details className="mt-2">
                        <summary className="cursor-pointer text-xs opacity-80 text-blue-500 underline">
                          Click to see Connection String examples
                        </summary>
                        <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-green-500">
                          <li>
                            PostgreSQL:{" "}
                            <code>
                              postgresql://[user]:[password]@[host]:[port]/[database]
                            </code>
                          </li>
                          <li>
                            MongoDB:{" "}
                            <code>
                              mongodb+srv://[username]:[password]@[cluster-url]/[database]
                            </code>
                          </li>
                        </ul>
                      </details>
                    </li>
                    <li>
                      Once connected, you can ask questions in plain English,
                      and the AI will generate the appropriate queries.
                    </li>
                    <li>
                      You can review the generated queries and the results
                      directly in the chat.
                    </li>
                    <li className="flex gap-2  items-center">
                      change theme by clicking <Settings size={20} />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg} />
              ))}
              {isThinking && <ThinkingIndicator />}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        <div className="  bg-background ">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="relative flex items-end gap-2 bg-[hsl(var(--message-assistant))] border border-[hsl(var(--input-border))] rounded-3xl px-4 py-3 shadow-sm">
              <button
                onClick={() => setShowUploadDialog(true)}
                className="hidden md:flex flex-shrink-0 p-1.5 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors "
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Message AI Data Assistant..."
                className="flex-1 bg-transparent outline-none resize-none max-h-[200px] py-1.5"
                style={{ minHeight: "24px" }}
                rows={1}
                disabled={isThinking}
              />

              <div className="flex items-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex-shrink-0 p-1.5 hover:bg-[hsl(var(--sidebar-hover))] rounded-lg transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload File
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowUploadDialog(true)}>
                      <Database className="w-4 h-4 mr-2" />
                      Connect Database
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() =>
                        setQueryLanguage(
                          queryLanguage === "auto"
                            ? "sql"
                            : queryLanguage === "sql"
                            ? "mongodb"
                            : "auto"
                        )
                      }
                    >
                      <Settings className="w-4 h-4 mr-2" />
                      Query: {queryLanguage}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={toggleTheme}>
                      {theme === "dark" ? (
                        <Sun className="w-4 h-4 mr-2" />
                      ) : (
                        <Moon className="w-4 h-4 mr-2" />
                      )}
                      {theme === "dark" ? "Light" : "Dark"} Mode
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <button
                onClick={handleSendMessage}
                disabled={isThinking || !inputValue.trim()}
                className={`flex-shrink-0 p-1.5 rounded-lg transition-colors ${
                  inputValue.trim() && !isThinking
                    ? "bg-[hsl(var(--foreground))] text-background hover:opacity-80"
                    : "opacity-30 cursor-not-allowed"
                }`}
              >
                <Send className="w-5 h-5" />
              </button>
            </div>

            {activeDataset && (
              <div className="flex items-center gap-2 mt-2 px-2 text-xs opacity-60">
                <div className="w-1.5 h-1.5 rounded-full bg-[#10a37f]"></div>
                <span>
                  {activeDataset.name} ({activeDataset.type})
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DatasetUpload
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onDatasetAdded={handleDatasetAdded}
        conversationId={activeConversationId}
      />
    </div>
  );
}

export default function Home() {
  return <ChatPage />;
}
