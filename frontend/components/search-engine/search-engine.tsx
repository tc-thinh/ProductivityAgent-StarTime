"use client";

import { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { CircleStop, Send, MessageCircle, AudioLines } from "lucide-react";
import { VoiceInputWithTranscript } from "./voice-recording";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND;

export function SearchEngine() {
  const isDay = new Date().getHours() < 18 && new Date().getHours() > 6;

  const [inputValue, setInputValue] = useState<string>("");
  const [isRecording, setIsRecording] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [currentTranscript, setCurrentTranscript] = useState<string>("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const voiceComponentRef = useRef<{ startListening?: () => void }>({});

  const newLineCount = (inputValue.match(/\n/g) || []).length;
  const maxLines = 10;
  const initialHeight = 50;
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight;

  const handleSearch = async () => {
    if (!inputValue.trim() && !transcript.trim() || isSearching) return;

    setIsSearching(true);
    const queryText = inputValue.trim() || transcript.trim();
    console.log("Current Input:", queryText);

    try {
      const response = await fetch(HTTP_BACKEND + "/agent/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: queryText,
          audioId: "",
        }),
      });

      const data = await response.json();
      console.log(data);

      window.location.href = `/${data.conversationId}`;
    } catch (error) {
      console.error("Error performing search:", error);
    } finally {
      setIsSearching(false);
      if (textareaRef.current) {
        textareaRef.current.blur();
      }
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSearch();
    }
  };

  const toggleRecording = () => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    if (newRecordingState && voiceComponentRef.current?.startListening) {
      setTimeout(() => {
        voiceComponentRef.current.startListening?.();
      }, 50);
    }
  };

  return (
    <div className="justify-content-center flex flex-col items-center">
      <div>
      {(isRecording || transcript) && (
          <div className="bg-secondary animate-fade-in w-[78vh]">
            {isRecording && (
              <div className="p-6">
                <VoiceInputWithTranscript
                  onStart={() => setIsRecording(true)}
                  onStop={(finalTranscript) => {
                    setTranscript(finalTranscript);
                    setCurrentTranscript("");
                    setIsRecording(false);
                  }}
                  onTranscriptChange={setCurrentTranscript}
                  autoStart={true}
                  ref={voiceComponentRef}
                />
              </div>
            )}
            {currentTranscript || transcript && (
              <div className="ml-6 mt-2">
                <p className="text-lg text-gray-900">{currentTranscript}</p>
              </div>
            )}
            {!isRecording && transcript && (
              <div className="ml-6 mt-2">
                <p className="text-sm text-gray-500">Voice transcript:</p>
                <Textarea
                  className="w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0"
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={2}
                />
              </div>
            )}
          </div>
        )}
      </div>

      <Card className="w-[80vh] mx-auto bg-white border border-gray-200 shadow-lg transition-all duration-300 mt-0">
        <CardContent style={{ height: `${cardHeight}px` }}>
          <Textarea
            ref={textareaRef}
            placeholder={`How can I help you this ${isDay ? "morning" : "evening"}?`}
            className={`w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 ${newLineCount < maxLines ? "cursor-transparent" : ""
              }`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isSearching}
            rows={8}
          />
        </CardContent>

        <CardFooter>
          <TooltipProvider>
            <div className="flex ml-auto space-x-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={"ghost"}
                    size="icon"
                    onClick={toggleRecording}
                    className={`flex-shrink-0 transition-all ${isRecording
                        ? "text-white bg-red-500 hover:bg-red-600"
                        : "text-gray-500 hover:text-gray-900 hover:bg-gray-100"
                      }`}
                  >
                    {isRecording ? (
                      <CircleStop className="h-4 w-4" />
                    ) : (
                      <AudioLines className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>{isRecording ? "Stop Transcribing" : "Start Transcribing"}</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    disabled={(!inputValue.trim() && !transcript.trim()) || isSearching}
                    className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    onClick={handleSearch}
                  >
                    {isSearching ? (
                      <MessageCircle className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Search</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardFooter>
      </Card>
    </div>
  );
}
