"use client"

import { useParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { ConversationMessage, ToolCall } from "@/lib/types"
import { SearchEngine } from "@/components/search-engine/search-engine"
import { ToolCallCard } from "@/components/tool-call-card/tool-call"
import { CheckCircle, Loader2 } from "lucide-react"

const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND

export default function ChatCanvas() {
  const { id } = useParams()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [conversationName, setConversationName] = useState<string>("Untitled")
  const [isLoading, setIsLoading] = useState(true)

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

  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      if (msg.role === "user") return true

      if (msg.role === "assistant" && typeof msg.content === 'string' && 
          msg.content.includes("scheduled")) {
        return true
      }
      
      if (msg.role === "tool") {
        const normalized = normalizeEventData(msg.content)
        return normalized.summary && normalized.start.dateTime
      }
      
      return false
    })
  }, [messages])

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
                className="p-4 rounded-lg max-w-[60%] bg-blue-50 ml-auto"
              >
                <div className="text-sm font-medium text-gray-700 mb-1">You</div>
                <div className="text-gray-900 whitespace-pre-line">
                  {typeof message.content === 'string' 
                    ? message.content 
                    : JSON.stringify(message.content)}
                </div>
              </div>
            )
          }

          if (message.role === "assistant") {
            return (
              <div 
                key={`${index}-assistant`} 
                className="p-4 rounded-lg max-w-[60%] bg-green-50 mr-auto"
              >
                <div className="flex items-center gap-2 text-gray-900">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>{message.content}</span>
                </div>
              </div>
            )
          }

          if (message.role === "tool") {
            const normalized = normalizeEventData(message.content)
            return (
              <div 
                key={`${index}-event`} 
                className="p-4 rounded-lg max-w-[60%] bg-gray-50 mr-auto mt-2"
              >
                <ToolCallCard 
                  result={{ content: { event_details: normalized }}}
                />
              </div>
            )
          }

          return null
        })}
      </div>
      
      <div className="sticky bottom-0 p-4">
        <SearchEngine />
      </div>
    </div>
  )
}