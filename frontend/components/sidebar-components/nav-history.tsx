"use client"

import { useState, useEffect } from "react"
import {
  ArrowUpRight,
  MoreHorizontal,
  Trash2,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

const BACKEND = process.env.BACKEND || 'http://localhost:8080'

interface History {
  name: string
  url: string
  emoji: string
  id: number
}

export function NavHistories() {
  const { isMobile } = useSidebar()
  const [histories, setHistories] = useState<History[]>([])

  const fetchHistory = async () => {
    try {
      const response = await fetch(BACKEND + "/database/conversations/"); 
      const result = await response.json();
      console.log('Data fetched:', result);

      const fetchedHistoryItems = result.map((item: { c_id: number; c_name: string, c_deleted: boolean }) => ({
        id: item.c_id,
        name: item.c_name,
        url: "/" + item.c_id,
      }));
      setHistories(fetchedHistoryItems)

    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  useEffect(() => {
    fetchHistory();
  }, [])

  const deleteConversation = async (conversationId: number) => {
    try {
        const response = await fetch(`${BACKEND}/database/conversations/?conversationId=${conversationId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to delete conversation");
        }

        // Update state to remove deleted conversation
        fetchHistory()

        console.log("Conversation deleted successfully");
    } catch (error: any) {
        console.error("Error deleting conversation:", error.message);
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>History</SidebarGroupLabel>
      <SidebarMenu>
        {histories.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <a href={item.url} title={item.name}>
                <span>{item.emoji}</span>
                <span>{item.name}</span>
              </a>
            </SidebarMenuButton>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuAction showOnHover>
                  <MoreHorizontal />
                  <span className="sr-only">More</span>
                </SidebarMenuAction>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align={isMobile ? "end" : "start"}
              >
                <DropdownMenuItem asChild>
                  <a href={item.url} target="_blank" rel="noopener noreferrer">
                    <ArrowUpRight className="text-muted-foreground" />
                    <span>Open in New Tab</span>
                  </a>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => deleteConversation(item.id)}>
                  <Trash2 className="text-muted-foreground" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton className="text-sidebar-foreground/70">
            <MoreHorizontal />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
