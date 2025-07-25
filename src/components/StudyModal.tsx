import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  aiApi,
  type ChatMessage,
  type ChatResponse,
  type ChapterizedSummaryResponse,
} from "../utils/api";
import PDFViewer from "./PDFViewer";
import { parseChaptersFromLLMSummary } from "../utils/lessonParser";

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  lessonId: number;
  pdfUrl: string;
  summary?: string;
  chapters?: string[];
}

const StudyModal: React.FC<StudyModalProps> = ({
  isOpen,
  onClose,
  lessonTitle,
  lessonId,
  pdfUrl,
  summary,
  chapters = [],
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm Tuna 🐟, and I'm here to help you study "${lessonTitle}". I have access to the lesson content and can answer questions about specific concepts, explain difficult topics, or help you understand the material better. What would you like to know?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chapterizedSummary, setChapterizedSummary] =
    useState<ChapterizedSummaryResponse | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "chapters" | "chat">(
    "summary"
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadChapterizedSummary = useCallback(async () => {
    setIsLoadingChapters(true);
    try {
      const response = await aiApi.createChapterizedSummary({
        lesson_id: lessonId,
      });
      setChapterizedSummary(response);
    } catch (error) {
      console.error("Failed to load chapterized summary:", error);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [lessonId]);

  // Reset chat when modal opens
  useEffect(() => {
    if (isOpen) {
      setMessages([
        {
          role: "assistant",
          content: `Hi! I'm Tuna 🐟, and I'm here to help you study "${lessonTitle}". I have access to the lesson content and can answer questions about specific concepts, explain difficult topics, or help you understand the material better. What would you like to know?`,
          timestamp: new Date().toISOString(),
        },
      ]);
      setActiveTab("summary");
      loadChapterizedSummary();
    }
  }, [isOpen, lessonTitle, lessonId, loadChapterizedSummary]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Include lesson context in the chat
      const contextualMessage = `[Context: User is studying lesson "${lessonTitle}" (ID: ${lessonId}). Please provide helpful, educational responses related to this lesson content.]\n\nUser question: ${userMessage.content}`;

      const response: ChatResponse = await aiApi.chatWithTuna({
        message: contextualMessage,
        conversation_history: messages,
      });

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ChatMessage = {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble responding right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        role: "assistant",
        content: `Chat cleared! I'm still here to help you study "${lessonTitle}". What would you like to know?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="text-2xl">📚</div>
            <div>
              <h3 className="text-lg font-semibold">Study Mode</h3>
              <p className="text-sm opacity-90">{lessonTitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded text-sm"
          >
            Close Study Mode
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Side - PDF Viewer */}
          <div className="w-1/2 border-r border-gray-200 flex flex-col">
            <div className="bg-gray-50 p-3 border-b">
              <h4 className="font-semibold text-gray-800">Lesson Material</h4>
            </div>
            <div className="flex-1 overflow-hidden">
              <PDFViewer pdfUrl={pdfUrl} title={lessonTitle} />
            </div>
          </div>

          {/* Right Side - Study Tools */}
          <div className="w-1/2 flex flex-col">
            {/* Tab Navigation */}
            <div className="bg-gray-50 border-b border-gray-200">
              <div className="flex">
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "summary"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📝 Summary
                </button>
                <button
                  onClick={() => setActiveTab("chapters")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "chapters"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  📖 Chapters
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-3 text-sm font-medium ${
                    activeTab === "chat"
                      ? "bg-white text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-gray-800"
                  }`}
                >
                  🐟 Ask Tuna
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "summary" && (
                <div className="h-full overflow-y-auto p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Lesson Summary
                  </h4>
                  {summary ? (
                    <div className="prose max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                        {summary}
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No summary available for this lesson.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chapters" && (
                <div className="h-full overflow-y-auto p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">
                    Chapter Breakdown (AI Generated)
                  </h4>
                  {isLoadingChapters ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="ml-2">Generating chapters...</span>
                    </div>
                  ) : chapterizedSummary &&
                    chapterizedSummary.chapters.length > 0 ? (
                    <div className="space-y-4">
                      {chapterizedSummary.chapters.map((chapter, index) => {
                        // Parse chapter title and content
                        const lines = chapter.split("\n");
                        const title =
                          lines[0]?.replace(/^Chapter \d+:\s*/, "") ||
                          `Chapter ${index + 1}`;
                        const content = lines.slice(1).join("\n").trim();

                        return (
                          <div
                            key={index}
                            className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500"
                          >
                            <h5 className="font-medium text-gray-800 mb-2 text-base">
                              {title}
                            </h5>
                            <div className="text-gray-700 text-sm whitespace-pre-wrap">
                              {content}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : chapters.length > 0 ? (
                    // Fallback to legacy chapters if LLM failed
                    <div className="space-y-3">
                      {parseChaptersFromLLMSummary(chapters).map(
                        (chapter, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 p-3 rounded-lg"
                          >
                            <h5 className="font-medium text-gray-800 mb-2">
                              Chapter {index + 1}
                            </h5>
                            <p className="text-gray-700 text-sm">{chapter}</p>
                          </div>
                        )
                      )}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">
                      No chapter breakdown available. Try refreshing to
                      regenerate chapters with AI.
                    </div>
                  )}
                </div>
              )}

              {activeTab === "chat" && (
                <div className="h-full flex flex-col">
                  {/* Chat Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((message, index) => (
                      <div
                        key={index}
                        className={`flex ${
                          message.role === "user"
                            ? "justify-end"
                            : "justify-start"
                        }`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            message.role === "user"
                              ? "bg-blue-600 text-white"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          <div className="whitespace-pre-wrap text-sm">
                            {message.content}
                          </div>
                          {message.timestamp && (
                            <div className="text-xs opacity-70 mt-1">
                              {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    {isLoading && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-800 px-4 py-2 rounded-lg">
                          <div className="flex items-center space-x-2">
                            <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                            <span className="text-sm">Tuna is thinking...</span>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Chat Input */}
                  <div className="border-t border-gray-200 p-4">
                    <div className="flex space-x-2 mb-2">
                      <button
                        onClick={clearChat}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear Chat
                      </button>
                    </div>
                    <form onSubmit={sendMessage} className="flex space-x-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        placeholder="Ask about this lesson..."
                        className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !inputMessage.trim()}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                      >
                        Send
                      </button>
                    </form>
                    <div className="mt-2 text-xs text-gray-500">
                      💡 Ask about specific concepts, request explanations, or
                      get study tips
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyModal;
