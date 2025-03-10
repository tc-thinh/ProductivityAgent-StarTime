"use client"

// TODO: Create a Chat Canvas (Another input Search Bar at the bottom)--Done
// TODO: Display ToolCall Arguments by using a Card
// TODO: Refactor all types into subitems of lib/types folder
// TODO: If tool_call_id in the message object is available, then the content message will be the 
// details of the tool call result
  // Create the type for the tool call result in types
  // Display that type by using a similar Card
// AC: Make sure that the design aligns with the other elements

"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { mockConversation1 } from "@/lib/data"
import { ConversationMessage } from "@/lib/types"
import { SearchEngine } from "@/components/widgets/search-engine"
import { ToolCallCard } from "@/components/tool-call-card/tool-call"
import { ToolCallResultCard } from "@/components/tool-call-card/tool-call-result"

const WS_BACKEND = process.env.WS_BACKEND || 'ws://localhost:8080'

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

    const ws = new WebSocket(`${WS_BACKEND}/ws/conversation/${id}/`)

    ws.onopen = () => console.log('WebSocket connection established')
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data).data
      switch (data.type) {
        case "conversation":
          setConversationName(data.message.c_name)
          setMessages((prevMessages) => [...prevMessages, ...data.message.c_messages])
          break
        case "conversation_name":
          setConversationName(data.message.c_name)
          break
        case "conversation_message":
          setMessages((prevMessages) => [...prevMessages, data.message])
          break
        default:
          console.log("Unknown message type")
          break
      }
    }
    ws.onclose = () => console.log('WebSocket connection closed')
    ws.onerror = (error) => console.error('WebSocket error:', error)

    return () => ws.close()
  }, [id])

  const handleNewMessage = (newMessage: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { 
        role: "user", 
        content: newMessage, 
        tool_calls: [], 
        tool_call_id: "" 
      }
    ])
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Messages */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-4  ${
              message.role === "user"
                ? "bg-blue-50 ml-auto max-w-[60%]"
                : message.role === "assistant" ||  message.role === "system"
                ? "bg-white mr-auto max-w-[60%]"
                : "bg-gray-100 mx-auto max-w-[80%]" // Tool role
            }`}
          >
            <div className="text-sm font-medium text-gray-700">
              {message.role === "user" ? "You" : message.role === "assistant" ? "Assistant" : message.role === "system" ? "System" : "Tool"}
            </div>
              {message.role !== "tool" && (
                <div className="mt-1 text-gray-900 whitespace-pre-line">{message.content}</div>
              )}
            
            {/* Display tool calls if they exist */}
            {message.tool_calls?.map((toolCall, idx) => (
              <ToolCallCard key={idx} toolCall={toolCall} />
            ))}
            
            {/* Display tool call result if tool_call_id exists */}
            {message.role === "tool" && message.tool_call_id && (
              <ToolCallResultCard result={{ tool_call_id: message.tool_call_id, content: message.content }} />
            )}
          </div>
        ))}
      </div>

      {/* Search engine at the bottom of the page */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 shadow-lg">
        <SearchEngine onNewMessage={handleNewMessage} />
      </div>
    </div>
  )
}