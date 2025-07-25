import React, { useState, useRef, useEffect } from "react";

// Minimal type declarations for browser SpeechRecognition API
// Only declare if not already present

interface SpeechRecognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  onresult: ((event: unknown) => void) | null;
  start: () => void;
  stop: () => void;
}
import { aiApi, type ChatMessage, type ChatResponse } from "../utils/api";

interface TunaChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const TunaChat: React.FC<TunaChatProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Hi! I'm Tuna, your AI learning assistant. I can help you with questions about lessons, summarize content, or just chat about what you're learning. How can I help you today?",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<{
    status: string;
    message: string;
  } | null>(null);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [listening, setListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      checkAIStatus();
    }
  }, [isOpen]);

  const checkAIStatus = async () => {
    try {
      const status = await aiApi.getAIStatus();
      setAiStatus(status);
    } catch (error) {
      console.error("Failed to check AI status:", error);
    }
  };

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
      const response: ChatResponse = await aiApi.chatWithTuna({
        message: userMessage.content,
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
        content:
          "Chat cleared! I'm Tuna, ready to help you again. What would you like to know?",
        timestamp: new Date().toISOString(),
      },
    ]);
  };

  // Speak AI response when voice is enabled
  useEffect(() => {
    if (!voiceEnabled) return;
    if (!window.speechSynthesis) return;
    if (messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === "assistant" && lastMsg.content) {
      const utter = new window.SpeechSynthesisUtterance(lastMsg.content);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utter);
    }
  }, [messages, voiceEnabled]);

  // Voice input
  useEffect(() => {
    if (!voiceEnabled || !isOpen) return;
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window))
      return;
    const SpeechRecognitionCtor =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return;
    const recognition = new SpeechRecognitionCtor() as SpeechRecognition;
    recognition.lang = "id-ID";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event: unknown) => {
      // Use 'unknown' for event to avoid 'any' and TS errors
      const transcript = (
        event as {
          results: { [key: number]: { [key: number]: { transcript: string } } };
        }
      ).results[0][0].transcript;
      setInputMessage(transcript);
      // Auto-send after speaking
      setTimeout(() => {
        if (transcript) {
          document.getElementById("tuna-chat-send-btn")?.click();
        }
      }, 300);
    };
    // Start listening automatically
    recognition.start();
    return () => {
      recognition.stop();
    };
  }, [voiceEnabled, isOpen]);

  const handleVoiceToggle = () => {
    setVoiceEnabled((v) => !v);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  const handleVoiceClose = () => {
    setVoiceEnabled(false);
    if (recognitionRef.current) recognitionRef.current.stop();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-3/4 flex flex-col">
        {/* Header */}
        <div className="bg-blue-600 text-white p-4 rounded-t-lg flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">🐟</div>
            <div>
              <h3 className="text-lg font-semibold">Tuna AI Assistant</h3>
              <p className="text-sm opacity-90">
                {aiStatus?.status === "online"
                  ? "Online and ready to help!"
                  : "Connecting..."}
              </p>
            </div>
          </div>
          <div className="flex space-x-2 items-center">
            {voiceEnabled ? (
              <>
                <span className="text-green-200 text-xs">Voice: Aktif</span>
                <button
                  onClick={handleVoiceClose}
                  className="bg-red-500 hover:bg-red-400 px-2 py-1 rounded text-xs"
                  title="Matikan Voice Mode"
                >
                  ✖
                </button>
              </>
            ) : (
              <button
                onClick={handleVoiceToggle}
                className="bg-blue-500 hover:bg-blue-400 px-2 py-1 rounded text-xs"
                title="Aktifkan Voice Mode"
              >
                🎤 Aktifkan Voice
              </button>
            )}
            <button
              onClick={clearChat}
              className="bg-blue-500 hover:bg-blue-400 px-3 py-1 rounded text-sm"
              title="Clear chat"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="bg-red-500 hover:bg-red-400 px-3 py-1 rounded text-sm"
            >
              Close
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 text-gray-800"
                }`}
              >
                <div className="whitespace-pre-wrap">{message.content}</div>
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
                  <span>Tuna is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <form onSubmit={sendMessage} className="p-4 border-t">
          <div className="flex space-x-2 items-center">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder={
                voiceEnabled
                  ? "Kamu bisa bicara atau ketik..."
                  : "Ask Tuna anything about your lessons..."
              }
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={isLoading}
            />
            <button
              id="tuna-chat-send-btn"
              type="submit"
              disabled={isLoading || !inputMessage.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
            {voiceEnabled && (
              <span
                className={`text-xs px-2 ${
                  listening ? "text-green-600" : "text-gray-400"
                }`}
              >
                {listening ? "Mendengarkan..." : "🎤 Voice Aktif"}
              </span>
            )}
          </div>
          <div className="mt-2 text-xs text-gray-500">
            💡 Coba bicara atau ketik: "Ringkas pelajaran 1", "Jelaskan konsep
            ini", atau "Bantu aku belajar"
          </div>
        </form>
      </div>
    </div>
  );
};

export default TunaChat;
