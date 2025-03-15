"use client";

import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { Mic } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceInputWithTranscriptProps {
  onStart?: () => void;
  onStop?: (transcript: string) => void;
  onTranscriptChange?: (transcript: string) => void;
  className?: string;
  autoStart?: boolean;
}

export const VoiceInputWithTranscript = forwardRef(function VoiceInputWithTranscript(
  { onStart, onStop, onTranscriptChange, className, autoStart = false }: VoiceInputWithTranscriptProps,
  ref
) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [audioLevels, setAudioLevels] = useState<number[]>([]);

  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useImperativeHandle(ref, () => ({
    startListening: () => {
      if (!isListening) setIsListening(true);
    },
    stopListening: () => {
      if (isListening) setIsListening(false);
    },
  }));

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
        };

        recognitionRef.current.onresult = (event) => {
          const newTranscript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("");
          setTranscript(newTranscript);
          onTranscriptChange?.(newTranscript);
        };
      } else {
        console.error("Speech recognition not supported in this browser");
      }
    }
  }, [onStart, onStop, onTranscriptChange]);

  useEffect(() => {
    if (autoStart) {
      const timer = setTimeout(() => setIsListening(true), 100);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  useEffect(() => {
    const recognition = recognitionRef.current;
    if (recognition) {
      if (isListening) {
        try {
          recognition.start();
        } catch (e) {
          console.log("Recognition already started", e);
        }
      } else {
        try {
          recognition.stop();
        } catch (e) {
          console.log("Recognition already stopped", e);
        }
      }
    }
    return () => {
      if (recognition) {
        try {
          recognition.stop();
        } catch (e) { }
      }
    };
  }, [isListening]);

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

  const toggleListening = () => {
    setIsListening((prev) => !prev);
  };

  return (
    <div className={cn("w-full py-4", className)}>
      <div className="relative max-w-xl w-full mx-auto flex items-center flex-col gap-2">
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
      </div>
    </div>
  );
});
