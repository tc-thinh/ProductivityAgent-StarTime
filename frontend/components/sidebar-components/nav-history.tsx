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
  id: number
  date: string
}

export function NavHistories() {
  const { isMobile } = useSidebar()
  const [todayHistories, setTodayHistories] = useState<History[]>([])
  const [olderHistories, setOlderHistories] = useState<History[]>([])
  const [showAll, setShowAll] = useState(false)

  const fetchHistory = async () => {
    try {
      const response = await fetch(BACKEND + "/database/conversations/"); 
      const result = await response.json();
      console.log('Data fetched:', result);

      const today = new Date().toISOString().split('T')[0];
      
      const fetchedHistoryItems = result.map((item: { c_id: number; c_name: string, c_created_at: string }) => {
        const conversationDate = new Date(item.c_created_at);
        const localDate = conversationDate.toLocaleString();
        return {
          id: item.c_id,
          name: item.c_name,
          url: "/" + item.c_id,
          date: localDate
        };
      });

      const todayItems = fetchedHistoryItems.filter((item: History) => new Date(item.date).toISOString().split('T')[0] === today);
      const olderItems = fetchedHistoryItems.filter((item: History) => new Date(item.date).toISOString().split('T')[0] !== today);
      
      setTodayHistories(todayItems);
      setOlderHistories(olderItems);
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

      fetchHistory()
      console.log("Conversation deleted successfully");
    } catch (error: any) {
      console.error("Error deleting conversation:", error.message);
    }
  }

  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Today's Conversations</SidebarGroupLabel>
      <SidebarMenu>
        {todayHistories.map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <a href={item.url} title={item.name}>
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
      </SidebarMenu>
      <SidebarGroupLabel>Older Conversations</SidebarGroupLabel>
      <SidebarMenu>
        {(showAll ? olderHistories : olderHistories.slice(0, 5)).map((item) => (
          <SidebarMenuItem key={item.id}>
            <SidebarMenuButton asChild>
              <a href={item.url} title={item.name}>
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
        {olderHistories.length > 5 && (
          <SidebarMenuItem>
            <SidebarMenuButton className="text-sidebar-foreground/70" onClick={() => setShowAll(!showAll)}>
              <MoreHorizontal />
              <span>{showAll ? "Show Less" : "View More"}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        )}
      </SidebarMenu>
    </SidebarGroup>
  )
}
