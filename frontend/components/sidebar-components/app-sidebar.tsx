"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { Bot, Terminal } from "lucide-react"
import { useSession } from "next-auth/react"

import { NavMain } from "@/components/sidebar-components/nav-main"
import { NavUser } from "@/components/sidebar-components/nav-user"
import { NavHistories } from "@/components/sidebar-components/nav-history"
import { TeamSwitcher } from "@/components/sidebar-components/team-switcher"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"
import { BotMessageSquare, FolderKanban } from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session, status } = useSession()

  const [data, setData] = useState({
    user: {
      name: "",
      email: "",
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
        title: "New Chat",
        "url": "/",
        icon: BotMessageSquare,
        isActive: true,
        items: []
      },
      {
        title: "Category Management",
        url: "/category-management",
        icon: FolderKanban,
        isActive: true,
        items: [
        ],
      }
    ]
  })

  useEffect(() => {
    if (session) {
      setData({
        ...data,
        user: {
          ...data.user,
          name: session.user?.name ?? "",
          email: session.user?.email ?? "",
          avatar: session.user?.image ?? "",
        },
      })
    }
  }, [session])


  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavHistories />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}