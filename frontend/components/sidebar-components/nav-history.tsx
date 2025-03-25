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
import { useUserStore } from "@/store/userStore"
import { fetchBackendService } from "@/lib/utils"
import { History, ConversationHeader } from "@/lib/types"
import { toast } from "sonner"

export function NavHistories() {
  const { isMobile } = useSidebar()
  const [todayHistories, setTodayHistories] = useState<History[]>([])
  const [olderHistories, setOlderHistories] = useState<History[]>([])
  const [showAll, setShowAll] = useState(false)

  const { accessToken, hydrated } = useUserStore()

  const fetchHistory = async () => {
    if (!(hydrated && accessToken)) return

    try {
      const { success, data, error } = await fetchBackendService<ConversationHeader[]>(
        {
          endpoint: `database/conversations/?token=${accessToken}`,
          method: "GET",
        }
      )

      if (!success) {
        toast.error(`Error fetching previous conversations: ${error}`)
      }

      const now = new Date()
      const today = now.toLocaleDateString()

      const fetchedHistoryItems = data?.map((item: ConversationHeader) => {
        const conversationDate = new Date(item.c_created_at)
        const localDate = conversationDate.toLocaleString()
        const localDateString = conversationDate.toLocaleDateString()

        return {
          id: item.c_id,
          name: item.c_name,
          url: "/" + item.c_id,
          date: localDate,
          isToday: localDateString === today
        }
      })

      const todayItems = fetchedHistoryItems?.filter((item: History) => item.isToday)
      const olderItems = fetchedHistoryItems?.filter((item: History) => !item.isToday)

      setTodayHistories(todayItems ?? [])
      setOlderHistories(olderItems ?? [])
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchHistory()
  }, [hydrated, accessToken])

  const deleteConversation = async (conversationId: number) => {
    const { success, data, error } = await fetchBackendService(
      {
        endpoint: `database/conversations/?conversationId=${conversationId}`,
        method: "DELETE",
        body: { token: accessToken }
      }
    )

    if (success) toast.success("Conversation successfully deleted.")
    else toast.error(`Error while deleting conversation: ${error}`)
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
