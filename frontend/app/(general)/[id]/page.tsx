"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { ConversationMessage, ToolCall } from "@/lib/types"
import { SearchEngine } from "@/components/search-engine/search-engine"
import { CreateEventCard } from "@/components/tool-call-card/CreateEventCard"
import { ToolWaitCard } from "@/components/tool-call-card/ToolWaitCard"
import { Loader2, Bot } from "lucide-react"
import { MarkdownContent } from "@/components/markdown-content"
import { useUserStore } from "@/store/userStore"
import { fetchBackendService, convertToBase64, combinePrompt } from "@/lib/utils"
import { toast } from "sonner"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

import { Path } from "@/lib/types"
import useBreadcrumbPath from "@/store/breadcrumbPathStore"
import { useApplicationStore } from "@/store/applicationStore"

const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND

const toolCallWrapper = (index: number, component: any) => {
  return (
    <div
      key={`${index}-event`}
      className="flex items-start gap-3 max-w-[60%] mr-auto"
    >
      <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
        <Bot className="h-5 w-5 text-gray-600" />
      </div>
      <div className="p-4 rounded-lg bg-gray-50 flex-1">
        {component}
      </div>
    </div>
  )
}

interface UserMessageContent {
  text: string,
  voiceTranscript: string
}

function extractUserMessageContent(content: any): UserMessageContent {
  // If content is an array of objects with text properties
  if (Array.isArray(content)) {
    return JSON.parse(content[0].text);
  }
  return { text: "", voiceTranscript: "" }
}

export default function ChatCanvas() {
  const { id } = useParams()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [conversationName, setConversationName] = useState<string>("Untitled")
  const [isLoading, setIsLoading] = useState(true)
  const { path, setPath } = useBreadcrumbPath()
  const { refreshSidebar } = useApplicationStore()

  const { accessToken, image } = useUserStore()

  // Handle search
  const handleSearch = async (promptText: string, voiceTranscript: string, images: File[]) => {
    if (!promptText.trim() && !voiceTranscript.trim()) return

    const queryText = combinePrompt({
      textPrompt: promptText.trim(),
      transcript: voiceTranscript
    })

    try {
      const imagesBase64: string[] = []

      for (let i = 0; i < images.length; i++) {
        const base64String = await convertToBase64(images[i]) as string
        imagesBase64.push(base64String)
      }

      const { success } = await fetchBackendService<{ conversationId: string }>(
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
        if (data.c_name || "Untitled" != conversationName) {
          setConversationName(data.c_name || "Untitled")
          refreshSidebar()
        }

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
    const transformed: ConversationMessage[] = []
    const toolResultsMap = new Map<string, any>() // Map tool_call_id to its result

    // First pass: Store tool messages in a map
    for (const msg of messages) {
      if (msg.role === "tool" && msg.tool_call_id) {
        toolResultsMap.set(msg.tool_call_id, msg.content)
      }
    }

    // Second pass: Process and merge tool calls with their results
    for (const msg of messages) {
      if (msg.role === "assistant" && msg.tool_calls?.length) {
        for (const toolCall of msg.tool_calls) {
          const mergedToolResult = toolResultsMap.get(toolCall.id) || null

          transformed.push({
            role: "tool",
            tool_call_id: toolCall.id,
            tool_call_result: {
              tool_call_id: toolCall.id,
              content: mergedToolResult,
              status: mergedToolResult ? "success" : "error"
            },
            tool_calls: [
              {
                id: toolCall.id,
                function: toolCall.function,
                type: toolCall.type
              }
            ],
            content: ""
          })
        }
      } else if (msg.role !== "tool") {
        transformed.push(msg) // Keep normal messages
      }
    }
    return transformed
  }, [messages])

  console.log(filteredMessages)

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
              <div key={`${index}-user`} className="flex max-w-[60%] ml-auto gap-3 items-start">
                <div className="flex flex-col w-full">
                  {/* Secondary Transcript Box (on top) */}
                  {extractUserMessageContent(message.content).voiceTranscript && (
                    <div className="p-3 bg-gray-100 text-sm text-gray-700 rounded-lg w-full mb-1">
                      {extractUserMessageContent(message.content).voiceTranscript}
                    </div>
                  )}

                  {/* Main Text Content (below, ensuring same width) */}
                  {extractUserMessageContent(message.content).text && (
                    <div className="p-4 rounded-lg bg-blue-50 text-gray-900 whitespace-pre-line w-full">
                      <MarkdownContent content={extractUserMessageContent(message.content).text} />
                    </div>
                  )}
                </div>
                
                <div className="flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={image ?? ""} alt="User" />
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
                className="flex items-start gap-3 max-w-[60%] mr-auto"
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
            switch (message.tool_calls?.[0]?.function?.name) {
              case "CreateCalendarEvent":
                if (message.tool_call_result && message.tool_call_result?.content) {
                  const normalized = normalizeEventData(message.tool_call_result?.content)
                  return toolCallWrapper(index, <CreateEventCard
                    result={{ content: { event_details: normalized } }}
                  />)
                } else {
                  return toolCallWrapper(index, <ToolWaitCard
                    message="Creating Calendar Event..."
                  />)
                }
              case "GetTodayEvents":
                if (message.tool_call_result && message.tool_call_result?.content) {
                  return <></>
                } else {
                  return toolCallWrapper(index, <ToolWaitCard
                    message="Fetching Today's Event..."
                  />)
                }
              case "GetThisWeekEvents":
                if (message.tool_call_result && message.tool_call_result?.content) {
                  return <></>
                } else {
                  return toolCallWrapper(index, <ToolWaitCard
                    message="Fetching This Week's Event..."
                  />)
                }
            }
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
