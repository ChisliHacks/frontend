import { useEffect, useRef, useState } from "react";

// TypeScript: declare SpeechRecognition for browser compatibility
declare global {
  interface Window {
    webkitSpeechRecognition: {
      new (): ISpeechRecognition;
    };
    SpeechRecognition: {
      new (): ISpeechRecognition;
    };
  }
}

interface ISpeechRecognition {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: (() => void) | null;
  start(): void;
  stop(): void;
}

interface ISpeechRecognitionEvent {
  results: {
    0: {
      0: {
        transcript: string;
      };
    };
  };
}

// Hook for speech recognition and spacebar trigger
export function useVoiceNavigation(onResult: (text: string) => void) {
  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const [listening, setListening] = useState(false);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      onResult(transcript);
      setListening(false);
    };
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);

    const handleKeyDown = (e: KeyboardEvent) => {
      // Use the 'Backspace' key
      if (e.code === "Backspace" && !listening) {
        setListening(true);
        recognition.start();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      recognition.stop();
    };
    // eslint-disable-next-line
  }, [listening]);

  return { listening };
}
