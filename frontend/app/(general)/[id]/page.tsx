"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { ConversationMessage, ToolCall } from "@/lib/types"
import { SearchEngine } from "@/components/search-engine/search-engine"
import { ToolCallCard } from "@/components/tool-call-card/tool-call"
import { Loader2, Bot } from "lucide-react"
import { MarkdownContent } from "@/components/markdown-content"
import { useUserStore } from "@/store/userStore"
import { fetchBackendService, convertToBase64 } from "@/lib/utils"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Path } from "@/lib/types"
import useBreadcrumbPath from "@/store/breadcrumbPathStore"

const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND

export default function ChatCanvas() {
  const { id } = useParams()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [conversationName, setConversationName] = useState<string>("Untitled")
  const [isLoading, setIsLoading] = useState(true)
  const { path, setPath } = useBreadcrumbPath()

  const { accessToken, image } = useUserStore()

  // Handle search
  const handleSearch = async (promptText: string, voiceTranscript: string, images: File[]) => {
    if (!promptText.trim() && !voiceTranscript.trim()) return

    const queryText = promptText.trim() || voiceTranscript.trim()

    try {
      const imagesBase64: string[] = []

      for (let i = 0; i < images.length; i++) {
        const base64String = await convertToBase64(images[i]) as string
        imagesBase64.push(base64String)
      }

      const { success, data } = await fetchBackendService<{ conversationId: string }>(
        {
          endpoint: `ai/message/`,
          method: "POST",
          body: {
            "userPrompt": queryText,
            "token": accessToken || "",
            "images": imagesBase64,
            "conversationId": id,
          }
        }
      )
      if (!success) toast.error("Something went wrong. Please try again later")
      else toast.success("The AI agents are doing their best to help you! Please wait.")
    } catch (error) {
      console.error("Failed to connect to the backend: ", error)
      toast.error("Failed to connect to an AI agent. Please try again later.")
    } finally {
    }
  }

  // Helper function to normalize event data from different structures
  const normalizeEventData = (content: any) => {
    const eventDetails = content?.event_details || content

    // Handle both time_data and direct start/end formats
    const start = eventDetails?.time_data?.start || eventDetails?.start
    const end = eventDetails?.time_data?.end || eventDetails?.end

    return {
      summary: eventDetails?.summary,
      description: eventDetails?.description,
      status: eventDetails?.status || "scheduled",
      htmlLink: eventDetails?.htmlLink,
      start: {
        dateTime: start?.dateTime,
        timeZone: start?.timeZone
      },
      end: {
        dateTime: end?.dateTime,
        timeZone: end?.timeZone
      }
    }
  }

  useEffect(() => {
    if (!id) return

    setIsLoading(true)

    const ws = new WebSocket(`${WS_BACKEND}/ws/conversation/${id}/`)

    ws.onopen = () => console.log('WebSocket connection established')

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data).data
        setConversationName(data.c_name || "Untitled")

        const processedMessages = data.c_messages.map((msg: ConversationMessage) => {
          // Parse tool calls if they exist
          if (msg.role === "assistant" && msg.tool_calls) {
            return {
              ...msg,
              tool_calls: msg.tool_calls.map((tc: string | ToolCall) =>
                typeof tc === 'string' ? JSON.parse(tc) : tc
              )
            }
          }

          if (typeof msg.content === 'string') {
            try {
              return {
                ...msg,
                content: JSON.parse(msg.content)
              }
            } catch {
              return msg // Keep as string if not JSON
            }
          }
          return msg
        })

        setMessages(processedMessages)
        console.log(processedMessages)
      } catch (error) {
        console.error('Error processing message:', error)
      } finally {
        setIsLoading(false)
      }
    }

    ws.onclose = () => {
      console.log('WebSocket connection closed')
      setIsLoading(false)
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setIsLoading(false)
    }

    return () => ws.close()
  }, [id])

  useEffect(() => {
    const currentPath: Path[] = [{ displayName: conversationName, reference: `${id}` }]
    setPath(currentPath)
  }, [conversationName])

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Always show user messages
      if (msg.role === "user") return true
  
      // Show assistant messages that either:
      // 1. Contain scheduling confirmation
      // 2. Are normal messages (no tool calls)
      if (msg.role === "assistant") {
        const hasSchedulingConfirmation = typeof msg.content === 'string' && 
          msg.content.includes("scheduled")
        const isNormalMessage = !msg.tool_calls
        return hasSchedulingConfirmation || isNormalMessage
      }
  
      // Show tool messages that contain valid event data
      if (msg.role === "tool") {
        try {
          const content = typeof msg.content === 'string' 
            ? JSON.parse(msg.content) 
            : msg.content
          const event = content.event_details || content
          return event?.summary && (event.start?.dateTime || event.time_data?.start?.dateTime)
        } catch {
          return false
        }
      }
  
      return false
    })
  }, [messages])


  function extractUserMessageContent(content: any): string {
    // If content is already a string, return it directly
    if (typeof content === "string") {
      // Remove [TEXT]: prefix if present
      return content.replace("[TEXT]: ", "")
    }
  
    // If content is an array of objects with text properties
    if (Array.isArray(content)) {
      return content
        .map(item => item.text.replace("[TEXT]: ", "") || "")
        .join("\n")
        .trim()
    }
    // If content is an object with a text property
    if (content?.text) {
      return content.text
    }
    // Fallback - stringify if we can't extract text
    return JSON.stringify(content)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {filteredMessages.map((message, index) => {
          if (message.role === "user") {
            return (
              <div
                key={`${index}-user`}
                className="flex items-start gap-3 max-w-[60%] ml-auto"
              >
                
                <div className="p-4 rounded-lg bg-blue-50 flex-1">
                  <div className="text-gray-900 whitespace-pre-line">
                    <MarkdownContent content={extractUserMessageContent(message.content)} />
                  </div>
                </div>
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={image??""} alt="User" />
                    <AvatarFallback className="rounded-lg">CN</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            )
          }
  
          if (message.role === "assistant") {
            return (
              <div
                key={`${index}-assistant`}
                className="flex items-start gap-3 max-w-[80%] mx-auto"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-green-600" />
                </div>
                <div className="p-4 rounded-lg  flex-1">
                  <div className="text-gray-900">
                    <MarkdownContent content={message.content} />
                  </div>
                </div>
              </div>
            )
          }
  
          if (message.role === "tool") {
            const normalized = normalizeEventData(message.content)
            return (
              <div
                key={`${index}-event`}
                className="flex items-start gap-3 max-w-[80%] mx-auto"
              >
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                  <Bot className="h-5 w-5 text-gray-600" />
                </div>
                <div className="p-4 rounded-lg bg-gray-50 flex-1">
                  <ToolCallCard
                    result={{ content: { event_details: normalized } }}
                  />
                </div>
              </div>
            )
          }
  
          return null
        })}
      </div>
  
      <div className="sticky bottom-0 p-4">
        <SearchEngine handleSearch={handleSearch} />
      </div>
    </div>
  )
}