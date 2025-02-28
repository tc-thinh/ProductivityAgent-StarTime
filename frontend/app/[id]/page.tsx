"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"

interface Message {
    role: string
    content: string
    tool_calls: string
    tool_call_id: string
}

const WS_BACKEND = process.env.BACKEND || 'ws://localhost:8080'

export default function ChatCanvas()  {
    const { id } = useParams()
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        if (!id) return

        const ws = new WebSocket(`${WS_BACKEND}/ws/section/${id}/`)

        ws.onopen = () => {
            console.log('WebSocket connection established')
        }

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data)
            setMessages((prevMessages) => [...prevMessages, message])
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
        <div>
            {messages.map((message, index) => (
                <li key={index}>
                    <strong>{message.role}:</strong> {message.content}
                </li>
            ))}
        </div>
    )
}