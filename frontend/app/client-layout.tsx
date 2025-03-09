// app/client-layout.tsx
"use client"

import { AppSidebar } from "@/components/sidebar-components/app-sidebar"
import { Toaster } from "@/components/ui/sonner"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger />
          </div>
        </header>
        {children}
      </SidebarInset>
      <Toaster />
    </div>
  );
}