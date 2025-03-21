"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { CircleStop, Send, AudioLines, Paperclip, Images } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export function SearchEngine() {
  const isDay = new Date().getHours() < 11 && new Date().getHours() > 6
  const isNight = new Date().getHours() > 18 || new Date().getHours() < 6

  // State declarations
  const [inputValue, setInputValue] = useState<string>("")
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [transcript, setTranscript] = useState<string>("")
  const [images, setImages] = useState<File[]>([])

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Dynamic height calculation for CardContent
  const newLineCount = (inputValue.match(/\n/g) || []).length
  const maxLines = 10
  const initialHeight = 50
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight

  // Handle search functionality
  const handleSearch = async () => {
    if (!inputValue.trim() && !transcript.trim()) return

    const queryText = inputValue.trim() || transcript.trim()
    console.log("Current Input:", queryText)

    try {
      const response = await fetch(`${HTTP_BACKEND}/agent/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: queryText,
          audioId: "",
        }),
      })

      const data = await response.json()
      console.log(data)
      toast.success("The AI agents are doing their best to help you! Please wait.")
      window.location.href = `/${data.conversationId}`
    } catch (error) {
      console.error("Failed to connect to the backend: ", error)
      toast.error("Failed to connect to an AI agent. Please try again later.")
    } finally {
      if (textareaRef.current) {
        textareaRef.current.blur()
      }
    }
  }

  // Set up SpeechRecognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = "en-US"

        recognitionRef.current.onstart = () => {
          setIsRecording(true)
        }

        recognitionRef.current.onend = () => {
          setIsRecording(false)
        }

        recognitionRef.current.onresult = (event) => {
          const newTranscript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("")
          setTranscript(newTranscript)
        }
      } else {
        console.error("Speech recognition not supported in this browser")
        toast.error("Speech recognition not supported in this browser")
      }

      // Cleanup on unmount
      return () => {
        recognitionRef.current?.stop()
      }
    }
  }, [])

  // Handle Enter key press for search
  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSearch()
    }
  }

  const handlePaste = (event: React.ClipboardEvent) => {
    const items = event.clipboardData.items
    for (const item of items) {
      if (item.type.indexOf("image") === 0) {
        const file = item.getAsFile()
        if (!file) return
        setImages((prevImages) => [...prevImages, file])
      }
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const imageFiles = Array.from(files)
      setImages((prevImages) => [...prevImages, ...imageFiles])
    }
  }

  const handleAttachButtonClick = () => {
    fileInputRef.current?.click()
  }

  // Toggle recording
  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop()
      setIsRecording(false)
    } else {
      recognitionRef.current?.start()
    }
  }

  return (
    <div className="justify-content-center flex flex-col items-center transition-all duration-300">
      {/* Transcript Textarea (Secondary Panel) */}
      <div className="w-[75vh] bg-gray-100 shadow-lg">
        {transcript && (
          <div>
            <Textarea
              className="text-sm bg-transparent text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 p-3"
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={2}
              disabled={isRecording}
            />
          </div>
        )}
      </div>

      {/* Main Search Card */}
      <Card className="w-[80vh] mx-auto bg-white border border-gray-200 shadow-lg transition-all duration-300 mt-0">
        <CardContent style={{ height: `${cardHeight}px` }}>
          <Textarea
            ref={textareaRef}
            placeholder={`How can I help you ${isDay ? "this morning" : isNight ? "this evening" : "today"}?`}
            className={`w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 ${newLineCount < maxLines ? "cursor-transparent" : ""
              }`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyPress}
            rows={8}
            onPaste={handlePaste}
          />
        </CardContent>

        <CardFooter>
          <div className="flex ml-auto space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  type="button"
                  variant={"ghost"}
                  onClick={handleAttachButtonClick}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Attach Image</p>
              </TooltipContent>
            </Tooltip>

            <input
              type="file"
              accept="image/png, image/jpeg, image/jpg"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileChange}
            />

            {images.length > 0 && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    className="relative flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                    type="button"
                    variant={"ghost"}
                    onClick={handleAttachButtonClick}
                  >
                    <Images className="h-4 w-4" />
                    <Badge
                      variant="secondary"
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs text-[10px] p-0"
                    >
                      {images.length}
                    </Badge>
                  </Button>
                  {/* Will be a dropdown menu later */}
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p>Show Attached Images</p>
                </TooltipContent>
              </Tooltip>
            )}

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
                <p>{isRecording ? "Stop Listening" : "Start Listening"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="icon"
                  disabled={(!inputValue.trim())}
                  className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
                  onClick={handleSearch}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">
                <p>Send</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
