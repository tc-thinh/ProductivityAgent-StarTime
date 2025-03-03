"use client"

import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { AppSidebar } from "@/components/sidebar-components/app-sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"

// will be deprecated soon
interface Message {
    role: string
    content: string
    tool_calls: string
    tool_call_id: string
}

const WS_BACKEND = process.env.WS_BACKEND || 'ws://localhost:8080'

export default function ChatCanvas()  {
    const { id } = useParams()
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        if (!id) return
        
        console.log(`${WS_BACKEND}/ws/conversation/${id}/`)
        const ws = new WebSocket(`${WS_BACKEND}/ws/conversation/${id}/`)

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
        <SidebarProvider>
          <AppSidebar />
          <SidebarInset>
            <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="#">
                    Conversation Name
                  </BreadcrumbLink>
                </BreadcrumbItem>
              </BreadcrumbList>
            </header>
            <div>
                {messages.map((message, index) => (
                    <li key={index}>
                        <strong>{message.role}:</strong> {message.content}
                    </li>
                ))}
            </div>
          </SidebarInset>
        </SidebarProvider>
      )
}