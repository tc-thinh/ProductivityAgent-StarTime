"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { useUserStore } from "@/store/userStore"

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
import {
  BotMessageSquare,
  LayoutGrid,
  Inbox,
  LayoutList,
  CalendarDays,
  AtSign,
  FolderSync,
  Bot,
  Vault
} from "lucide-react"

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { email, name, image, authenticated, hydrated } = useUserStore()

  const [data, setData] = useState({
    user: {
      name: "",
      email: "",
      avatar: "",
    },
    teams: [
      {
        name: "StarTime!",
        logo: Bot,
      },
    ],
    navAssistant: [
      {
        title: "New Chat",
        "url": "/",
        icon: BotMessageSquare,
        isActive: true,
        items: [
        ]
      },
      {
        title: "Vault",
        "url": "/vault",
        icon: Vault,
        isActive: true,
        items: [
        ]
      }
    ],
    navEvents: [
      {
        title: "Today Events",
        url: "/today-events",
        icon: CalendarDays,
        isActive: true,
        items: [
        ],
      },
      {
        title: "Category Management",
        url: "/category-management",
        icon: LayoutGrid,
        isActive: true,
        items: [
        ],
      }
    ],
    navTasks: [
      {
        title: "Today Tasks",
        url: "/today-tasks",
        icon: LayoutList,
        isActive: true,
        items: [
        ],
      },
      {
        title: "Backlog",
        url: "/backlog-tasks",
        icon: Inbox,
        isActive: true,
        items: [
        ],
      }
    ],
    navBriefs: [
      {
        title: "Today Briefs",
        url: "/today-briefs",
        icon: AtSign,
        isActive: true,
        items: [
        ],
      },
      {
        title: "Previous Briefs",
        url: "/backlog-briefs",
        icon: FolderSync,
        isActive: true,
        items: [
        ],
      }
    ]
  })

  useEffect(() => {
    if (!hydrated) return

    if (authenticated) {
      setData({
        ...data,
        user: {
          ...data.user,
          name: name ?? "",
          email: email ?? "",
          avatar: image ?? "",
        },
      })
    }
  }, [authenticated, hydrated])

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={data.teams} />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navAssistant} groupName="Your Assistant" />
        <NavMain items={data.navEvents} groupName="Events Manager" />
        {/* <NavMain items={data.navTasks} groupName="Tasks Manager" /> */}
        {/* <NavMain items={data.navBriefs} groupName="Briefings" /> */}
        {/* <NavHistories /> */}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
