"use client";

import { useState, useEffect, useRef } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

interface VoiceInputWithTranscriptProps {
  onStart?: () => void;
  onStop?: (transcript: string) => void;
  className?: string;
}

export function VoiceInputWithTranscript({
  onStart,
  onStop,
  className,
}: VoiceInputWithTranscriptProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>([]);
  const [isEditing, setIsEditing] = useState(false);

  // Use useRef to store the recognition instance
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null); // Ref for the Textarea

  // Initialize SpeechRecognition once
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = "en-US";

        recognitionRef.current.onstart = () => {
          setIsListening(true);
          onStart?.();
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
          onStop?.(transcript);
          setIsEditing(true); // Enable editing after stopping
        };

        recognitionRef.current.onresult = (event) => {
          const newTranscript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");

          setTranscript(newTranscript);
        };
      } else {
        console.error("Speech recognition not supported in this browser");
      }
    }
  }, [onStart, onStop, transcript]);

  // Start/stop recognition based on isListening
  useEffect(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      if (isListening) {
        recognition.start();
      } else {
        recognition.stop();
      }
    }

    // Cleanup on unmount
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [isListening]);

  // Simulate audio levels for the visualizer
  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isListening) {
      intervalId = setInterval(() => {
        const levels = Array.from({ length: 20 }, () => Math.random() * 100);
        setAudioLevels(levels);
      }, 100);
    } else {
      setAudioLevels([]);
    }

    return () => clearInterval(intervalId);
  }, [isListening]);

  // Auto-focus on the Textarea when editing starts
  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus(); // Focus the Textarea when editing starts
    }
  }, [isEditing]);

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  // Save the transcript and stop editing
  const handleSaveTranscript = () => {
    setIsEditing(false);
    onStop?.(transcript); // Pass the updated transcript back to the parent
  };

  // Handle keydown events in the Textarea
  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Prevent newline on Enter
      handleSaveTranscript(); // Save the transcript
    }
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
        <button
          className={cn(
            "group w-16 h-16 rounded-xl flex items-center justify-center transition-colors",
            isListening
              ? "bg-none"
              : "bg-none hover:bg-black/10 dark:hover:bg-white/10"
          )}
          type="button"
          onClick={toggleListening}
        >
          {isListening ? (
            <div
              className="w-6 h-6 rounded-sm animate-spin bg-black dark:bg-white cursor-pointer pointer-events-auto"
              style={{ animationDuration: "3s" }}
            />
          ) : (
            <Mic className="w-6 h-6 text-black/70 dark:text-white/70" />
          )}
        </button>

        <div className="h-4 w-64 flex items-center justify-center gap-0.5">
          {audioLevels.map((level, i) => (
            <div
              key={i}
              className={cn(
                "w-0.5 rounded-full transition-all duration-300",
                isListening
                  ? "bg-black/50 dark:bg-white/50 animate-pulse"
                  : "bg-black/10 dark:bg-white/10 h-1"
              )}
              style={{
                height: `${level}%`,
                animationDelay: `${i * 0.05}s`,
              }}
            />
          ))}
        </div>

        <p className="h-4 text-xs text-black/70 dark:text-white/70">
          {isListening ? "Click to stop and edit" : "Click to speak"}
        </p>

        {transcript && (
          <div className="w-full bg-background rounded-lg">
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={transcript}
                onChange={(e) => setTranscript(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSaveTranscript}
                className="w-full text-sm text-black/70 dark:text-white/70 bg-transparent border-none focus:outline-none focus:ring-0 resize-none"
                rows={2}
              />
            ) : (

              <p className="text-sm text-black/70 dark:text-white/70">
                {transcript}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}