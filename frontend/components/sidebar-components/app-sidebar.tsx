"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Bot, Terminal } from "lucide-react"

import { NavMain } from "@/components/sidebar-components/nav-main"
import { NavUser } from "@/components/sidebar-components/nav-user"
import { TeamSwitcher } from "@/components/sidebar-components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

const BACKEND = process.env.BACKEND || 'http://localhost:8080'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [data, setData] = useState({
    user: {
      name: "Thinh Tran",
      email: "thinh.tran@example.com",
      avatar: "",
    },
    teams: [
      {
        name: "Thinh Tran",
        logo: Terminal,
      },
      {
        name: "StarTime!",
        logo: Bot,
      },
    ],
    navMain: [
      {
        title: "History",
        url: "#",
        icon: "history",
        isActive: true,
        items: [
          // {
          //   title: "Starred",
          //   url: "#",
          // },
          // {
          //   title: "All",
          //   url: "#",
          // },
        ],
      },
      {
        title: "Category Management",
        url: "/category-management",
        icon: "tags",
        isActive: true,
        items: [
        ],
      }
    ],
  })
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(BACKEND + "/database/conversations/"); 
        const result = await response.json();
        console.log('Data fetched:', result);

        const fetchedHistoryItems = result.map((item: { s_id: number; s_name: string, s_starred: boolean, s_price: number, s_total_tokens: number }) => ({
          id: item.s_id,
          title: item.s_name + (item.s_starred ? " ★" : ""),
          url: "/" + item.s_id,
        }));
        // console.log(fetchedHistoryItems)

        setData(prevData => ({
          ...prevData,
          navMain: prevData.navMain.map((item, index) =>
            index === 0 ? { ...item, items: fetchedHistoryItems } : item
          ),
        }))

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    
    fetchData();
  }, [])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}