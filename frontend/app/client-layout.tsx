"use client"

import { AppSidebar } from "@/components/sidebar-components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import DynamicBreadcrumb from "@/components/dynamic-breadcrumb/dynamic-breadcrumb"
import { HistoryDialog } from "@/components/history-dialog/history-dialog"
import { Separator } from "@/components/ui/separator"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  if (status === "unauthenticated") {
    window.location.href = "/unauthorized"
  }

  return (
    <div className="flex">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4 bg-transparent w-full">
            <SidebarTrigger />
            <Separator orientation="vertical" className="mr-2 h-4" />
            <DynamicBreadcrumb className="flex-1" /> {/* Takes up remaining space */}
            <HistoryDialog className="" /> {/* No ml-auto */}
          </div>
        </header>
        {children}
      </SidebarInset>
      <Toaster />
    </div>
  );
}
