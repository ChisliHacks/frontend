import React, { useState, useRef, useEffect, useCallback } from "react";
// VoiceTunaChat: Voice-enabled chat for StudyModal

interface VoiceTunaChatProps {
  messages: ExtendedChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ExtendedChatMessage[]>>;
  inputMessage: string;
  setInputMessage: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  sendMessage: (e: React.FormEvent) => void;
  clearChat: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
  handleQuizAnswer: (questionIndex: number, selectedOption: number, optionText: string, messageIndex: number) => void;
}

const VoiceTunaChat: React.FC<VoiceTunaChatProps> = ({ messages, inputMessage, setInputMessage, isLoading, sendMessage, clearChat, messagesEndRef, handleQuizAnswer }) => {
  const [voiceEnabled, setVoiceEnabled] = useState(true); 
  const [listening, setListening] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const synthRef = useRef(window.speechSynthesis);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null);
  const lastSpokenRef = useRef("");

  // Speak last AI message when it arrives
  useEffect(() => {
    if (!voiceEnabled) return;
    if (!window.speechSynthesis) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === "assistant" && lastMsg.content && lastMsg.content !== lastSpokenRef.current) {
      lastSpokenRef.current = lastMsg.content;
      setSpeaking(true);
      const utter = new window.SpeechSynthesisUtterance(lastMsg.content);
      utter.onend = () => {
        setSpeaking(false);
        // Restart listening after AI finishes speaking
        setTimeout(() => {
          if (recognitionRef.current && voiceEnabled && !isLoading) {
            recognitionRef.current.start();
          }
        }, 500);
      };
      synthRef.current.cancel();
      synthRef.current.speak(utter);
    }
  }, [messages, voiceEnabled, isLoading]);

  // Voice input setup
  useEffect(() => {
    if (!voiceEnabled) return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) return;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;

    const recognition = new SpeechRecognitionCtor();
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      // Auto-restart listening after a short delay when voice is enabled
      if (voiceEnabled && !isLoading) {
        setTimeout(() => {
          if (recognitionRef.current && voiceEnabled) {
            recognitionRef.current.start();
          }
        }, 1000);
      }
    };
    recognition.onerror = () => {
      setListening(false);
      // Auto-restart listening after error if voice is still enabled
      if (voiceEnabled && !isLoading) {
        setTimeout(() => {
          if (recognitionRef.current && voiceEnabled) {
            recognitionRef.current.start();
          }
        }, 2000);
      }
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputMessage(transcript);
      // Auto-send after speaking
      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} } as React.FormEvent;
        sendMessage(fakeEvent);
      }, 300);
    };

    // Start listening immediately when voice is enabled
    if (voiceEnabled && !isLoading) {
      recognition.start();
    }

    return () => {
      recognition.stop();
    };
  }, [voiceEnabled, sendMessage, setInputMessage, isLoading]);

  // Voice mode UI
  return (
    <div className="h-full flex flex-col" data-tuna-chat>
      {/* Voice Mode Controls */}
      {voiceEnabled ? (
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-blue-600">🔊 Voice Mode Active</span>
              <span className="text-xs text-gray-500">{speaking ? "Speaking..." : listening ? "Listening..." : "Ready to listen"}</span>
            </div>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded text-xs bg-red-500 text-white hover:bg-red-400" onClick={() => setVoiceEnabled(false)}>
              Turn Off Voice
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between px-4 pt-2 pb-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-gray-500">🔇 Voice Mode Disabled</span>
          </div>
          <div className="flex space-x-2">
            <button className="px-3 py-1 rounded text-xs bg-blue-600 text-white hover:bg-blue-700" onClick={() => setVoiceEnabled(true)}>
              Turn On Voice
            </button>
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index}>
            <div className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === "user" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}>
                <div className="whitespace-pre-wrap text-sm">{message.content}</div>
                {message.timestamp && <div className="text-xs opacity-70 mt-1">{new Date(message.timestamp).toLocaleTimeString()}</div>}
              </div>
            </div>
            {/* Render quiz component if this message contains quiz data */}
            {message.role === "assistant" && message.quizData && (
              <div className="mt-2">
                <QuizComponent quizData={message.quizData} onAnswer={(questionIndex, selectedOption, optionText) => handleQuizAnswer(questionIndex, selectedOption, optionText, index)} />
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
          <button onClick={clearChat} className="text-xs text-gray-500 hover:text-gray-700">
            Clear Chat
          </button>
        </div>
        <form onSubmit={sendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={voiceEnabled ? "Speak or type your question..." : "Ask about this lesson..."}
            className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={isLoading}
            data-tuna-input
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm">
            Send
          </button>
        </form>
        <div className="mt-2 text-xs text-gray-500">
          💡 {voiceEnabled ? "Voice is always listening - just speak naturally" : "Ask about specific concepts, request explanations, or get study tips"}
        </div>
      </div>
    </div>
  );
};
import { aiApi, type ChatMessage, type ChatResponse, type ChapterizedSummaryResponse } from "../utils/api";
import PDFViewer from "./PDFViewer";
import { useLocation } from "react-router";
import { parseChaptersFromLLMSummary } from "../utils/lessonParser";
import QuizComponent, { type QuizData } from "./QuizComponent";
import { parseQuizFromAIResponse, formatQuizAnswerForAI } from "../utils/quizParser";

interface ExtendedChatMessage extends ChatMessage {
  quizData?: QuizData;
}

interface StudyModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonTitle: string;
  lessonId: number;
  pdfUrl: string;
  summary?: string;
  chapters?: string[];
}

const StudyModal: React.FC<StudyModalProps> = (props) => {
  const { isOpen, onClose, lessonTitle, lessonId, pdfUrl, summary, chapters = [] } = props;
  const location = useLocation();

  const [messages, setMessages] = useState<ExtendedChatMessage[]>([
    {
      role: "assistant",
      content: `Hi! I'm Tuna 🐟, and I'm here to help you study "${lessonTitle}". I have access to the lesson content and can answer questions about specific concepts, explain difficult topics, or help you understand the material better. What would you like to know?`,
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [chapterizedSummary, setChapterizedSummary] = useState<ChapterizedSummaryResponse | null>(null);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);
  const tabFromUrl = (() => {
    const match = location.pathname.match(/\/study\/(summary|chapters|chat)$/);
    return match ? match[1] : "chat";
  })();
  const [activeTab, setActiveTab] = useState<"chat" | "chapters" | "summary">(tabFromUrl as "chat" | "chapters" | "summary");
  const messagesEndRef = useRef<HTMLDivElement>(null) as React.RefObject<HTMLDivElement>;

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
      setActiveTab("chat");
      loadChapterizedSummary();
    }
  }, [isOpen, lessonTitle, lessonId, loadChapterizedSummary]);

  const handleQuizAnswer = async (questionIndex: number, selectedOption: number, optionText: string, messageIndex: number) => {
    // Find the message with the quiz
    const quizMessage = messages[messageIndex];
    if (!quizMessage?.quizData) return;

    const questionText = quizMessage.quizData.questions[questionIndex].question;
    const formattedAnswer = formatQuizAnswerForAI(questionIndex, selectedOption, optionText, questionText);

    // Send answer to AI for feedback WITHOUT adding user message to chat
    setIsLoading(true);

    try {
      // Send to AI for feedback using the formatted answer
      const response: ChatResponse = await aiApi.chatWithTuna({
        message: formattedAnswer,
        conversation_history: messages,
      });

      // Only add AI's feedback response to the chat
      const assistantMessage: ExtendedChatMessage = {
        role: "assistant",
        content: response.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Failed to get quiz feedback:", error);
      const errorMessage: ExtendedChatMessage = {
        role: "assistant",
        content: "I'm sorry, I'm having trouble providing feedback right now. Please try again later.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

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
      let contextualMessage = `[Context: User is studying lesson "${lessonTitle}" (ID: ${lessonId}).`;

      if (summary) {
        contextualMessage += ` Lesson Summary: "${summary}".`;
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
        content: "I'm sorry, I'm having trouble responding right now. Please try again later.",
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
          <button onClick={onClose} className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded text-sm">
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
                  onClick={() => setActiveTab("chat")}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "chat" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
                  🐟 Ask Tuna
                </button>
                <button
                  onClick={() => setActiveTab("chapters")}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "chapters" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
                  📖 Chapters
                </button>
                <button
                  onClick={() => setActiveTab("summary")}
                  className={`px-4 py-3 text-sm font-medium ${activeTab === "summary" ? "bg-white text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-gray-800"}`}>
                  📝 Summary
                </button>
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === "chat" && (
                <VoiceTunaChat
                  messages={messages}
                  setMessages={setMessages}
                  inputMessage={inputMessage}
                  setInputMessage={setInputMessage}
                  isLoading={isLoading}
                  sendMessage={sendMessage}
                  clearChat={clearChat}
                  messagesEndRef={messagesEndRef}
                  handleQuizAnswer={handleQuizAnswer}
                />
              )}

              {activeTab === "chapters" && (
                <div className="h-full overflow-y-auto p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Chapter Breakdown (AI Generated)</h4>
                  {isLoadingChapters ? (
                    <div className="flex items-center justify-center h-32">
                      <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                      <span className="ml-2">Generating chapters...</span>
                    </div>
                  ) : chapterizedSummary && chapterizedSummary.chapters.length > 0 ? (
                    <div className="space-y-4">
                      {chapterizedSummary.chapters.map((chapter, index) => {
                        // Parse chapter title and content
                        const lines = chapter.split("\n");
                        const title = lines[0]?.replace(/^Chapter \d+:\s*/, "") || `Chapter ${index + 1}`;
                        const content = lines.slice(1).join("\n").trim();

                        return (
                          <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                            <h5 className="font-medium text-gray-800 mb-2 text-base">{title}</h5>
                            <div className="text-gray-700 text-sm whitespace-pre-wrap">{content}</div>
                          </div>
                        );
                      })}
                    </div>
                  ) : chapters.length > 0 ? (
                    // Fallback to legacy chapters if LLM failed
                    <div className="space-y-3">
                      {parseChaptersFromLLMSummary(chapters).map((chapter, index) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <h5 className="font-medium text-gray-800 mb-2">Chapter {index + 1}</h5>
                          <p className="text-gray-700 text-sm">{chapter}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No chapter breakdown available. Try refreshing to regenerate chapters with AI.</div>
                  )}
                </div>
              )}

              {activeTab === "summary" && (
                <div className="h-full overflow-y-auto p-4">
                  <h4 className="font-semibold text-gray-800 mb-3">Lesson Summary</h4>
                  {summary ? (
                    <div className="prose max-w-none">
                      <div className="text-gray-700 whitespace-pre-wrap text-sm leading-relaxed">{summary}</div>
                    </div>
                  ) : (
                    <div className="text-gray-500 italic">No summary available for this lesson.</div>
                  )}
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
