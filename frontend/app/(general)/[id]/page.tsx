"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { mockConversation1, mockConversation2, mockConversation3 } from "@/lib/data"
import { ConversationMessage } from "@/lib/types"
import { SearchEngine } from "@/components/search-engine/search-engine"
import { ToolCallCard } from "@/components/tool-call-card/tool-call"
import { CheckCircle } from "lucide-react"

const WS_BACKEND = process.env.NEXT_PUBLIC_WS_BACKEND

export default function ChatCanvas() {
  const { id } = useParams()
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [conversationName, setConversationName] = useState<string>("Untitled")

  useEffect(() => {
    if (!id) return
    if (id === "0") {
      setMessages(mockConversation1.message)
      setConversationName("New Conversation")
      return
    }
    if (id === "2") {
      setMessages(mockConversation2.message)
      setConversationName("New Conversation")
      return
    }
    if (id === "3") {
      setMessages(mockConversation3.message)
      setConversationName("New Conversation")
      return
    }

    const ws = new WebSocket(`${WS_BACKEND}/ws/conversation/${id}/`)

    ws.onopen = () => console.log('WebSocket connection established')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data).data
      console.log(data)
      setConversationName(data.c_name)
      setMessages(data.c_messages)
    }
    ws.onclose = () => console.log('WebSocket connection closed')
    ws.onerror = (error) => console.error('WebSocket error:', error)

    return () => ws.close()
  }, [id])

  return (
    <>
      <div className="flex-col h-full space-y-4 p-9 overflow-y-auto">
        {messages
          .filter((message) => message.role !== "system" && message.role !== "tool") // Filter out system and tool messages
          .map((message, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${
                message.role === "user"
                  ? "bg-blue-50 ml-auto max-w-[60%]"
                  : message.role === "assistant"
                  ? message.content.includes("scheduled") 
                    ? "bg-green-50 mr-auto max-w-[60%] border border-green-100" 
                    : "bg-white mr-auto max-w-[60%] border border-gray-100" 
                  : "" 
              }`}
            >
              <div className="text-sm font-medium text-gray-700">
                {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : "Tool"}
              </div>
              {message.role !== "tool" && (
                <div className="mt-1 text-gray-900 whitespace-pre-line">
                  {message.content.includes("scheduled")  ? ( 
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="w-5 h-5 text-green-500" /> 
                      <span>{message.content}</span>
                    </div>
                  ) : (
                    message.content
                  )}
                </div>
              )}
              
              {/* Display tool calls if they exist */}
              {message.tool_calls?.map((toolCall, idx) => {
                const result = messages.find(
                  (m) => m.role === "tool" && m.tool_call_id === toolCall.id
                )

                return (
                  <div key={idx} className="mt-2">
                    <ToolCallCard toolCall={toolCall} result={result} />
                  </div>
                )
              })}
            </div>
          ))}
      </div>
      <div className="sticky inset-x-0 bottom-0 p-4">
        <SearchEngine />
      </div>
    </>
  )
}