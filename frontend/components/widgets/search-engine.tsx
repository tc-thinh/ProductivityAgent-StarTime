"use client"

import { useState, useRef, useEffect } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MicOff, Send, MessageCircle, AudioLines } from "lucide-react" // Added Volume2 for voice icon

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export function SearchEngine() {
  const [inputValue, setInputValue] = useState<string>("")
  const [file, setFile] = useState<File | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Calculate the number of new lines in the input value
  const newLineCount = (inputValue.match(/\n/g) || []).length
  const maxLines = 10 // Maximum number of lines before adding the cursor
  const initialHeight = 50
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight // 24px per line (adjust as needed)

  // Speech recognition setup
  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = true
        recognition.interimResults = true
        recognition.lang = "en-US"

        recognition.onstart = () => {
          setIsListening(true)
        }

        recognition.onend = () => {
          setIsListening(false)
        }

        recognition.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0])
            .map((result) => result.transcript)
            .join("")

          setInputValue(transcript)
        }

        // Start/stop recording
        if (isRecording) {
          recognition.start()
        } else if (isListening) {
          recognition.stop()
        }

        // Cleanup
        return () => {
          if (isListening) {
            recognition.stop()
          }
        }
      } else {
        console.error("Speech recognition not supported in this browser")
      }
    }
  }, [isRecording])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      console.log("File selected:", selectedFile.name)
      // You can add file upload logic here (e.g., send to an API)
    }
  }

  const handleSearch = async () => {
    if (!inputValue.trim() || isSearching) return

    setIsSearching(true)
    console.log("Current Input:", inputValue)

    try {
      const response = await fetch(HTTP_BACKEND + "/agent/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userPrompt: inputValue,
          audioId: "",
        }),
      })

      const data = await response.json()
      console.log(data)

      window.location.href = `/${data.conversationId}`
    } catch (error) {
      console.error("Error performing search:", error)
    } finally {
      setIsSearching(false)
      
      if (textareaRef.current) {
        textareaRef.current.blur()
      }
    }
  }

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSearch()
    }
  }

  const toggleRecording = () => {
    setIsRecording(!isRecording)
  }

  return (
    <Card
      className="w-[80vh] mx-auto bg-white border border-gray-200 shadow-lg transition-all duration-300"
    >
      <CardContent style={{ height: `${cardHeight}px` }}>
        <Textarea
          ref={textareaRef}
          placeholder="Ask me anything..."
          className={`w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0 ${
            newLineCount < maxLines ? "cursor-transparent" : "" // Hide cursor if less than 10 lines
          }`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSearching}
          rows={8}
        />
      </CardContent>
      <CardFooter>
        <div className="flex ml-auto space-x-2">
          {/* Recording Button with Voice Icon and Animation */}
          <Button
            type="button"
            variant={isRecording ? "destructive" : "ghost"}
            size="icon"
            onClick={toggleRecording}
            className={`flex-shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all ${
              isRecording ? "animate-pulse" : ""
            }`}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4 animate-pulse" /> 
            ) : (
              <AudioLines className="h-4 w-4" />
            )}
          </Button>

        
          <Button
            size="icon"
            disabled={!inputValue.trim() || isSearching}
            className="flex-shrink-0 hover:text-gray-900 hover:bg-gray-100 transition-all"
            onClick={handleSearch}
          >
            {isSearching ? <MessageCircle className="h-4 w-4" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}