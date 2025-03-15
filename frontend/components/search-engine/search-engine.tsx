"use client"

import { useState, useRef } from "react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { MicOff, Send, MessageCircle, AudioLines } from "lucide-react"
import { VoiceInputWithTranscript } from "./voice-recording"

const HTTP_BACKEND = process.env.NEXT_PUBLIC_HTTP_BACKEND

export function SearchEngine() {
  const [inputValue, setInputValue] = useState<string>("")
  const [isRecording, setIsRecording] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [transcript, setTranscript] = useState("") // State to store the transcript
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const newLineCount = (inputValue.match(/\n/g) || []).length
  const maxLines = 10
  const initialHeight = 50
  const cardHeight = newLineCount > 0 ? Math.min(newLineCount + 2, maxLines) * 24 : initialHeight // 24px per line (adjust as needed)

  
  const handleTranscript = (newTranscript: string) => {
    setTranscript(newTranscript); // Update the transcript state
  };

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
            newLineCount < maxLines ? "cursor-transparent" : "" 
          }`}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isSearching}
          rows={8}
        />
      </CardContent>

      {/* Voice Input Panel (shown when recording) */}
      {isRecording && (
        <div className="p-6">
          <VoiceInputWithTranscript
            onStart={() => setIsRecording(true)}
            onStop={handleTranscript} // Pass transcript back to parent
          />
        </div>
      )}

      {/* Display transcript in a separate Textarea when not recording */}
      {!isRecording && transcript && (
        <div className="ml-6 mt-2">
          <p className="text-sm text-gray-500">Voice action:</p>
          <Textarea
            className="w-full text-lg bg-transparent rounded-lg text-gray-900 placeholder-gray-500 resize-none focus:outline-none focus:ring-0"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            rows={2}
          />
        </div>
      )}

      <CardFooter>
        <div className="flex ml-auto space-x-2">
          {/* Recording Button with Voice Icon and Animation */}
          <Button
            type="button"
            variant={"ghost"}
            size="icon"
            onClick={toggleRecording}
            className={`flex-shrink-0 text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-all`}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" /> 
            ) : (
              <AudioLines className="h-4 w-4" />
            )}
          </Button>

          {/* Send Button */}
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