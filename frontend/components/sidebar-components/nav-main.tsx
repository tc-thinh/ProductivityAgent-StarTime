"use client"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { ChevronDown, ChevronUp, Home, Settings, Users } from "lucide-react"
import { ElementType } from "react"

export function NavMain({
  items,
  groupName,
}: {
  items: {
    title: string
    url: string
    icon?: ElementType
    isActive?: boolean
    items?: {
      id: number
      title: string
      url: string
    }[]
  }[],
  groupName?: string
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{groupName}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          item.items && item.items.length > 0 ? (
            <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip={item.title}>
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
                {item.items && item.items.length > 0 && (
                  <ChevronDown className="ml-auto h-4 w-4 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-180" />
                )}
              </SidebarMenuButton>
              </CollapsibleTrigger>
              {item.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {item.items.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.id}>
                        <SidebarMenuSubButton asChild>
                          <a href={subItem.url}>
                            <span>{subItem.title}</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
          ) : (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton asChild tooltip={item.title}>
              <a href={item.url} className="text-black no-underline">
                {item.icon && <item.icon className="h-4 w-4" />}
                <span>{item.title}</span>
              </a>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )  
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}