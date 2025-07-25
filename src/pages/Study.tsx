import React, { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router";
import {
  aiApi,
  lessonsApi,
  type ChatMessage,
  type ChatResponse,
  type ChapterizedSummaryResponse,
  type Lesson,
} from "../utils/api";
import PDFViewer from "../components/PDFViewer";
import QuizComponent, { type QuizData } from "../components/QuizComponent";
import {
  parseQuizFromAIResponse,
  formatQuizAnswerForAI,
} from "../utils/quizParser";

interface ExtendedChatMessage extends ChatMessage {
  quizData?: QuizData;
}

const Study: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([]);
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

  // Load lesson data
  useEffect(() => {
    const fetchLesson = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError(null);
        const lessonData = await lessonsApi.getLesson(parseInt(id));
        setLesson(lessonData);

        // Initialize chat when lesson is loaded
        setMessages([
          {
            role: "assistant",
            content: `Hi! I'm Tuna 🐟, and I'm here to help you study "${lessonData.title}". I have access to the lesson content and can answer questions about specific concepts, explain difficult topics, or help you understand the material better. What would you like to know?`,
            timestamp: new Date().toISOString(),
          },
        ]);
      } catch (err: unknown) {
        const error = err as Error;
        setError(error.message || "Failed to load lesson");
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [id]);

  const loadChapterizedSummary = useCallback(async () => {
    if (!lesson?.id) return;

    setIsLoadingChapters(true);
    try {
      const response = await aiApi.createChapterizedSummary({
        lesson_id: lesson.id,
      });
      setChapterizedSummary(response);
    } catch (error) {
      console.error("Failed to load chapterized summary:", error);
    } finally {
      setIsLoadingChapters(false);
    }
  }, [lesson?.id]);

  // Load chapterized summary when lesson is available
  useEffect(() => {
    if (lesson) {
      loadChapterizedSummary();
    }
  }, [lesson, loadChapterizedSummary]);

  const handleQuizAnswer = async (
    questionIndex: number,
    selectedOption: number,
    optionText: string,
    messageIndex: number
  ) => {
    // Find the message with the quiz
    const quizMessage = messages[messageIndex];
    if (!quizMessage?.quizData) return;

    const questionText = quizMessage.quizData.questions[questionIndex].question;
    const formattedAnswer = formatQuizAnswerForAI(
      questionIndex,
      selectedOption,
      optionText,
      questionText
    );

    // Send answer to AI for feedback WITHOUT adding user message to chat
    setIsLoading(true);

    try {
      // Send to AI for feedback using the formatted answer
      const response: ChatResponse = await aiApi.chatWithTuna({
        message: formattedAnswer,
        conversation_history: messages,
      });

      // Check if the response contains quiz content for follow-up questions
      const quizData = parseQuizFromAIResponse(response.response);

      // Only add AI's feedback response to the chat
      const assistantMessage: ExtendedChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        quizData: quizData || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get quiz feedback:", error);
      const errorMessage: ExtendedChatMessage = {
        role: "assistant",
        content:
          "I'm sorry, I'm having trouble providing feedback right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading || !lesson) return;

    const userMessage: ExtendedChatMessage = {
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Include comprehensive lesson context in the chat
      let contextualMessage = `[Context: User is studying lesson "${lesson.title}" (ID: ${lesson.id}).`;

      if (lesson.summary) {
        contextualMessage += ` Lesson Summary: "${lesson.summary}".`;
      }

      contextualMessage += ` Please provide helpful, educational responses related to this specific lesson content. When creating quizzes, base them on the actual lesson material provided.]\n\nUser question: ${userMessage.content}`;

      const response: ChatResponse = await aiApi.chatWithTuna({
        message: contextualMessage,
        conversation_history: messages,
      });

      // Check if the response contains quiz content
      const quizData = parseQuizFromAIResponse(response.response);

      const assistantMessage: ExtendedChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
        quizData: quizData || undefined,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to send message:", error);
      const errorMessage: ExtendedChatMessage = {
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
    if (!lesson) return;

    setMessages([
      {
        role: "assistant",
        content: `Chat cleared! I'm still here to help you study "${lesson.title}". What would you like to know?`,
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  const handleGoBack = () => {
    navigate(`/lessons/${id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        <span className="ml-2">Loading lesson...</span>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || "Lesson not found"}</p>
          <button
            onClick={handleGoBack}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const pdfUrl = lesson.filename
    ? `${
        import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api/v1"
      }/upload/files/${encodeURIComponent(lesson.filename)}`
    : "";

  // Debug: Log the PDF URL and lesson data
  console.log("Lesson data:", lesson);
  console.log("PDF URL:", pdfUrl);
  console.log("API Base URL:", import.meta.env.VITE_API_BASE_URL);
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 flex justify-between items-center shadow-lg">
        <div className="flex items-center space-x-3">
          <button
            onClick={handleGoBack}
            className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm flex items-center"
          >
            ← Back
          </button>
          <div className="text-2xl">📚</div>
          <div>
            <h1 className="text-xl font-semibold">Study Mode</h1>
            <p className="text-sm opacity-90">{lesson.title}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Side - PDF Viewer */}
        <div className="w-1/2 border-r border-gray-200 flex flex-col">
          <div className="bg-gray-50 p-3 border-b">
            <h2 className="font-semibold text-gray-800">Lesson Material</h2>
          </div>
          <div className="flex-1 overflow-hidden">
            {pdfUrl ? (
              <PDFViewer pdfUrl={pdfUrl} title={lesson.title} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                <p>No PDF material available for this lesson</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side - Study Tools */}
        <div className="w-1/2 flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-gray-50 border-b border-gray-200">
            <div className="flex">
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
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            {activeTab === "summary" && (
              <div className="h-full overflow-y-auto p-4">
                <h3 className="font-semibold text-gray-800 mb-3">
                  Lesson Summary
                </h3>
                {lesson.summary ? (
                  <div className="prose max-w-none">
                    <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">
                      {lesson.summary}
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
                <h3 className="font-semibold text-gray-800 mb-3">
                  Chapter Breakdown (AI Generated)
                </h3>
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
                          <h4 className="font-medium text-gray-800 mb-2 text-base">
                            {title}
                          </h4>
                          <div className="text-gray-700 text-sm whitespace-pre-wrap">
                            {content}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-gray-500 italic">
                    No chapter breakdown available. Try refreshing to regenerate
                    chapters with AI.
                  </div>
                )}
              </div>
            )}

            {activeTab === "chat" && (
              <div className="h-full flex flex-col">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message, index) => (
                    <div key={index}>
                      <div
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
                      {/* Render quiz component if this message contains quiz data */}
                      {message.role === "assistant" && message.quizData && (
                        <div className="mt-2">
                          <QuizComponent
                            quizData={message.quizData}
                            onAnswer={(
                              questionIndex,
                              selectedOption,
                              optionText
                            ) =>
                              handleQuizAnswer(
                                questionIndex,
                                selectedOption,
                                optionText,
                                index
                              )
                            }
                          />
                        </div>
                      )}
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
                    💡 Ask about specific concepts, request explanations, or get
                    study tips
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Study;
