"use client"

// TODO: Create a Chat Canvas (Another input Search Bar at the bottom)
// TODO: Display ToolCall Arguments by using a Card
// TODO: Refactor all types into subitems of lib/types folder
// TODO: If tool_call_id in the message object is available, then the content message will be the 
// details of the tool call result
  // Create the type for the tool call result in types
  // Display that type by using a similar Card
// AC: Make sure that the design aligns with the other elements



import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { mockConversation1 } from "@/lib/data"
import { ConversationMessage, ToolCall } from "@/lib/types"

const WS_BACKEND = process.env.WS_BACKEND || 'ws://localhost:8080'
const HTTP_BACKEND = process.env.BACKEND || 'http://localhost:8080'


export default function ChatCanvas()  {
    const { id } = useParams()
    const [messages, setMessages] = useState<ConversationMessage[]>()
    const [conversationName, setConversationName] = useState<string>("Untitled")

    useEffect(() => {
        if (!id) return
        if (id === "0") {
          setMessages(mockConversation1.message)
          setConversationName("New Conversation")
          return 
        }
        
        console.log(`${WS_BACKEND}/ws/conversation/${id}/`)
        const ws = new WebSocket(`${WS_BACKEND}/ws/conversation/${id}/`)

        ws.onopen = () => {
            console.log('WebSocket connection established')
        }

        ws.onmessage = (event) => {
            const data = JSON.parse(event.data).data
            console.log(data)

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
                console.log(":( What is this?")
                break
            }
        }

        ws.onclose = () => {
            console.log('WebSocket connection closed')
        }

        ws.onerror = (error) => {
            console.error('WebSocket error:', error)
        }

        return () => {
            ws.close()
        }
    }, [id])

    return (
      <>
        <div>
            {messages && messages.map((message, index) => (
                <li key={index}>
                    <strong>{message.role}:</strong> {message.content}
                    {message.tool_calls && (
                        <div>
                            <strong>Tool Calls:</strong>
                            {message.tool_calls.map((tool_call, toolIndex) => (
                                <div key={toolIndex}>
                                    <strong>Function:</strong> {tool_call.function.name} <br />
                                    <strong>Arguments:</strong> {tool_call.function.arguments}
                                </div>
                            ))}
                        </div>
                    )}
                </li>
            ))}
        </div>
      </>
    )
}
